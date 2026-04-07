const { createServer } = require('http');
const { randomUUID } = require('crypto');
const { demoUser } = require('./demo-user');
const sessionStore = require('./session-store');

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function getBearerToken(request) {
  const header = request.headers.authorization;
  return header ? header.replace('Bearer ', '').trim() : null;
}

async function requestHandler(request, response) {
  if (request.method === 'OPTIONS') {
    return json(response, 200, { ok: true });
  }

  if (request.method === 'POST' && request.url === '/auth/login') {
    const body = await readJson(request).catch(() => null);
    if (!body?.email || !body?.password) {
      return json(response, 400, { message: 'Email and password are required.' });
    }

    if (body.email !== demoUser.email || body.password !== demoUser.password) {
      return json(response, 401, { message: 'Invalid email or password.' });
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 12 * 60 * 60 * 1000);
    const sessionId = randomUUID();

    sessionStore.createSession({
      sessionId,
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    return json(response, 200, {
      token: sessionId,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role
      }
    });
  }

  if (request.method === 'POST' && request.url === '/auth/logout') {
    const token = getBearerToken(request);
    if (token) {
      sessionStore.deleteSession(token);
    }
    return json(response, 200, { success: true });
  }

  if (request.method === 'GET' && request.url === '/auth/session') {
    const token = getBearerToken(request);
    if (!token) {
      return json(response, 401, { message: 'Missing session token.' });
    }

    const session = sessionStore.getSession(token);
    if (!session) {
      return json(response, 401, { message: 'Invalid session.' });
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      sessionStore.deleteSession(token);
      return json(response, 401, { message: 'Session expired.' });
    }

    return json(response, 200, {
      token,
      expiresAt: session.expiresAt,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role
      }
    });
  }

  return json(response, 404, { message: 'Not found.' });
}

const server = createServer((request, response) => {
  void requestHandler(request, response).catch((error) => {
    json(response, 500, {
      message: error instanceof Error ? error.message : 'Internal server error.'
    });
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '127.0.0.1';
  server.listen(port, host);
}

module.exports = {
  server,
  requestHandler
};
