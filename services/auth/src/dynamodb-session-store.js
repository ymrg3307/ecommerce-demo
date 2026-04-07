const { createHash, createHmac } = require('crypto');
require('./env');

const memorySessions = new Map();

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function hmac(key, value, encoding) {
  return createHmac('sha256', key).update(value).digest(encoding);
}

function getConfig() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
  const endpoint =
    process.env.DYNAMODB_ENDPOINT || (region ? `https://dynamodb.${region}.amazonaws.com` : '');

  return {
    region,
    endpoint,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || '',
    tableName: process.env.DYNAMODB_TABLE_SESSIONS || ''
  };
}

function isConfigured() {
  const config = getConfig();
  return Boolean(
    config.region &&
      config.endpoint &&
      config.accessKeyId &&
      config.secretAccessKey &&
      config.tableName
  );
}

function getStorageMode() {
  return isConfigured() ? 'dynamodb' : 'memory';
}

function marshallRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, { S: String(value) }])
  );
}

function unmarshallRecord(item) {
  if (!item) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => {
      if ('S' in value) {
        return [key, value.S];
      }

      return [key, value];
    })
  );
}

async function dynamoRequest(target, payload) {
  const config = getConfig();
  if (!isConfigured()) {
    throw new Error('DynamoDB session store is not configured.');
  }

  const url = new URL(config.endpoint);
  const body = JSON.stringify(payload);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const headers = {
    'content-type': 'application/x-amz-json-1.0',
    host: url.host,
    'x-amz-date': amzDate,
    'x-amz-target': `DynamoDB_20120810.${target}`,
    'x-amz-content-sha256': sha256Hex(body)
  };

  if (config.sessionToken) {
    headers['x-amz-security-token'] = config.sessionToken;
  }

  const sortedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderNames
    .map((headerName) => `${headerName}:${headers[headerName]}\n`)
    .join('');
  const signedHeaders = sortedHeaderNames.join(';');
  const canonicalRequest = [
    'POST',
    url.pathname || '/',
    '',
    canonicalHeaders,
    signedHeaders,
    headers['x-amz-content-sha256']
  ].join('\n');

  const credentialScope = `${dateStamp}/${config.region}/dynamodb/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join('\n');

  const kDate = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, config.region);
  const kService = hmac(kRegion, 'dynamodb');
  const signingKey = hmac(kService, 'aws4_request');
  const signature = hmac(signingKey, stringToSign, 'hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      ...headers,
      Authorization: authorization
    },
    body
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.message || data?.Message || data?.__type || 'DynamoDB request failed.';
    throw new Error(message);
  }

  return data || {};
}

async function createSession(record) {
  if (!isConfigured()) {
    memorySessions.set(record.sessionId, record);
    return;
  }

  await dynamoRequest('PutItem', {
    TableName: getConfig().tableName,
    Item: marshallRecord(record)
  });
}

async function getSession(sessionId) {
  if (!isConfigured()) {
    return memorySessions.get(sessionId) ?? null;
  }

  const response = await dynamoRequest('GetItem', {
    TableName: getConfig().tableName,
    Key: {
      sessionId: { S: sessionId }
    },
    ConsistentRead: true
  });

  return unmarshallRecord(response.Item);
}

async function deleteSession(sessionId) {
  if (!isConfigured()) {
    memorySessions.delete(sessionId);
    return;
  }

  await dynamoRequest('DeleteItem', {
    TableName: getConfig().tableName,
    Key: {
      sessionId: { S: sessionId }
    }
  });
}

module.exports = {
  createSession,
  getSession,
  deleteSession,
  getStorageMode,
  isConfigured
};
