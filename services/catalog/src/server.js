const { createServer } = require('http');
const { URL } = require('url');
const { demoProducts } = require('./demo-products');

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(payload));
}

function searchProducts(keyword) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return demoProducts.filter((product) =>
    [product.name, product.category, product.description, ...product.tags]
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  );
}

function getProduct(id) {
  return demoProducts.find((product) => product.id === id) ?? null;
}

function requestHandler(request, response) {
  if (request.method === 'OPTIONS') {
    return json(response, 200, { ok: true });
  }

  const url = new URL(request.url, 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/products') {
    return json(response, 200, searchProducts(url.searchParams.get('keyword') || ''));
  }

  if (request.method === 'GET' && url.pathname.startsWith('/products/')) {
    const id = url.pathname.replace('/products/', '');
    const product = getProduct(id);
    if (!product) {
      return json(response, 404, { message: 'Product not found.' });
    }

    return json(response, 200, product);
  }

  return json(response, 404, { message: 'Not found.' });
}

const server = createServer(requestHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 3002);
  const host = process.env.HOST || '127.0.0.1';
  server.listen(port, host);
}

module.exports = {
  server,
  requestHandler,
  searchProducts,
  getProduct
};
