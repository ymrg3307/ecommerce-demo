require('./env');
const { demoProducts } = require('./demo-products');
const { MongoClient } = require('mongodb');

let client = null;
let db = null;
let collection = null;

function getConfig() {
  return {
    uri: process.env.MONGODB_URI || '',
    database: process.env.MONGODB_DATABASE || 'ctt-demo',
    collection: process.env.MONGODB_PRODUCTS_COLLECTION || 'products'
  };
}

function isConfigured() {
  const config = getConfig();
  return Boolean(config.uri && config.database);
}

function getStorageMode() {
  return isConfigured() ? 'mongodb-native' : 'memory';
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

async function connect() {
  if (!isConfigured()) {
    throw new Error('MongoDB is not configured.');
  }
  if (!client) {
    const config = getConfig();
    client = new MongoClient(config.uri);
    await client.connect();
    db = client.db(config.database);
    collection = db.collection(config.collection);
  }
  return collection;
}

let seedPromise = null;

async function ensureSeeded() {
  if (!isConfigured()) {
    return;
  }

  if (!seedPromise) {
    seedPromise = (async () => {
      const coll = await connect();
      const existing = await coll.findOne({});
      if (existing) {
        return;
      }
      await coll.insertMany(demoProducts);
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  await seedPromise;
}

async function searchProducts(keyword) {
  const normalized = (keyword || '').trim();

  if (!isConfigured()) {
    if (!normalized) return demoProducts;
    return demoProducts.filter((product) =>
      [product.name, product.category, product.description, ...product.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalized.toLowerCase())
    );
  }

  await ensureSeeded();
  const coll = await connect();
  
  let filter = {};
  if (normalized) {
    const regex = {
      $regex: escapeRegex(normalized),
      $options: 'i'
    };
    filter = {
      $or: [
        { name: regex },
        { category: regex },
        { description: regex },
        { tags: regex }
      ]
    };
  }

  const documents = await coll.find(filter).sort({ name: 1 }).limit(24).toArray();

  return documents.map(normalizeDocument);
}

async function getProduct(id) {
  if (!isConfigured()) {
    return demoProducts.find((product) => product.id === id) ?? null;
  }

  await ensureSeeded();
  const coll = await connect();
  const document = await coll.findOne({ id });

  return normalizeDocument(document);
}

module.exports = {
  ensureSeeded,
  searchProducts,
  getProduct,
  getStorageMode,
  isConfigured
};
