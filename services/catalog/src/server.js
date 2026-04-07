const { createServer } = require('http');
const { URL } = require('url');
require('./env');
const { searchProducts, getProduct, getStorageMode } = require('./catalog-store');

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(payload));
}

async function requestHandler(request, response) {
  if (request.method === 'OPTIONS') {
    return json(response, 200, { ok: true });
  }

  const url = new URL(request.url, 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/products') {
    const products = await searchProducts(url.searchParams.get('keyword') || '');
    return json(response, 200, products);
  }

  if (request.method === 'GET' && url.pathname.startsWith('/products/')) {
    const id = url.pathname.replace('/products/', '');
    const product = await getProduct(id);
    if (!product) {
      return json(response, 404, { message: 'Product not found.' });
    }

    return json(response, 200, product);
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
  const port = Number(process.env.PORT || 3002);
  const host = process.env.HOST || '127.0.0.1';
  console.log(`[catalog-service] product store: ${getStorageMode()}`);
  server.listen(port, host);
}

module.exports = {
  server,
  requestHandler,
  searchProducts,
  getProduct
};
