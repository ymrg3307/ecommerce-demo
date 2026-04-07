require('./env');
const { demoProducts } = require('./demo-products');

function getConfig() {
  return {
    baseUrl: (process.env.MONGODB_DATA_API_BASE_URL || '').replace(/\/$/, ''),
    apiKey: process.env.MONGODB_DATA_API_KEY || '',
    dataSource: process.env.MONGODB_DATA_SOURCE || '',
    database: process.env.MONGODB_DATABASE || '',
    collection: process.env.MONGODB_PRODUCTS_COLLECTION || 'products'
  };
}

function isConfigured() {
  const config = getConfig();
  return Boolean(config.baseUrl && config.apiKey && config.dataSource && config.database);
}

function getStorageMode() {
  return isConfigured() ? 'mongodb-atlas-data-api' : 'memory';
}

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeDocument(document) {
  if (!document) {
    return null;
  }

  const { _id, ...product } = document;
  return product;
}

async function dataApiRequest(action, payload) {
  const config = getConfig();
  if (!isConfigured()) {
    throw new Error('MongoDB Atlas Data API is not configured.');
  }

  const response = await fetch(`${config.baseUrl}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey
    },
    body: JSON.stringify({
      dataSource: config.dataSource,
      database: config.database,
      collection: config.collection,
      ...payload
    })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.error || data?.error_code || data?.detail || 'MongoDB Data API request failed.';
    throw new Error(message);
  }

  return data || {};
}

let seedPromise = null;

async function ensureSeeded() {
  if (!isConfigured()) {
    return;
  }

  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await dataApiRequest('findOne', {
        filter: {}
      });

      if (existing.document) {
        return;
      }

      await dataApiRequest('insertMany', {
        documents: demoProducts
      });
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  await seedPromise;
}

async function searchProducts(keyword) {
  const normalized = keyword.trim();
  if (!normalized) {
    return [];
  }

  if (!isConfigured()) {
    return demoProducts.filter((product) =>
      [product.name, product.category, product.description, ...product.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalized.toLowerCase())
    );
  }

  await ensureSeeded();
  const regex = {
    $regex: escapeRegex(normalized),
    $options: 'i'
  };

  const response = await dataApiRequest('find', {
    filter: {
      $or: [
        { name: regex },
        { category: regex },
        { description: regex },
        { tags: regex }
      ]
    },
    sort: {
      name: 1
    },
    limit: 24
  });

  return (response.documents || []).map(normalizeDocument);
}

async function getProduct(id) {
  if (!isConfigured()) {
    return demoProducts.find((product) => product.id === id) ?? null;
  }

  await ensureSeeded();
  const response = await dataApiRequest('findOne', {
    filter: {
      id
    }
  });

  return normalizeDocument(response.document);
}

module.exports = {
  ensureSeeded,
  searchProducts,
  getProduct,
  getStorageMode,
  isConfigured
};
