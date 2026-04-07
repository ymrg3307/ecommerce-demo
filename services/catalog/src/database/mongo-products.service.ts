import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, MongoClient } from 'mongodb';
import { CatalogProduct, demoProducts } from '../data/demo-products';

@Injectable()
export class MongoProductsService implements OnModuleInit {
  private readonly logger = new Logger(MongoProductsService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly fallbackProducts: CatalogProduct[] = [...demoProducts];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('MONGODB_URI');
    if (!uri) {
      this.logger.log('MongoDB not configured, using in-memory product data.');
      return;
    }

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(this.configService.get<string>('MONGODB_DB_NAME') ?? 'ctt_demo');

    const products = this.productsCollection();
    await products.createIndex({ name: 1 });
    await products.createIndex({ category: 1 });
    await products.createIndex({ tags: 1 });

    const existingCount = await products.countDocuments();
    if (existingCount === 0) {
      await products.insertMany(demoProducts);
    }
  }

  async search(keyword: string) {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    if (!this.db) {
      return this.fallbackProducts.filter((product) =>
        [product.name, product.category, product.description, ...product.tags]
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      );
    }

    const products = await this.productsCollection()
      .find({
        $or: [
          { name: { $regex: normalized, $options: 'i' } },
          { category: { $regex: normalized, $options: 'i' } },
          { description: { $regex: normalized, $options: 'i' } },
          { tags: { $elemMatch: { $regex: normalized, $options: 'i' } } }
        ]
      })
      .toArray();

    return products.map((product) => this.toProduct(product));
  }

  async getById(id: string) {
    if (!this.db) {
      const product = this.fallbackProducts.find((item) => item.id === id);
      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      return product;
    }

    const product = await this.productsCollection().findOne({ id });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return this.toProduct(product);
  }

  private productsCollection(): Collection {
    if (!this.db) {
      throw new Error('MongoDB is not configured.');
    }

    return this.db.collection(
      this.configService.get<string>('MONGODB_PRODUCTS_COLLECTION') ?? 'products'
    );
  }

  private toProduct(product: Record<string, unknown>): CatalogProduct {
    return {
      id: String(product.id),
      name: String(product.name),
      category: String(product.category),
      price: Number(product.price),
      description: String(product.description),
      image: String(product.image),
      tags: Array.isArray(product.tags) ? product.tags.map((tag) => String(tag)) : [],
      clothType: String(product.clothType),
      color: String(product.color),
      material: String(product.material),
      fit: String(product.fit),
      brand: String(product.brand)
    };
  }
}
