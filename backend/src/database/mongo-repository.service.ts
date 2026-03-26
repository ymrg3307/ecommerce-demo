import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, MongoClient } from 'mongodb';
import { createDemoUser, DemoProduct, DemoUser, demoProducts } from '../data/demo-data';

type SearchableProduct = DemoProduct;

@Injectable()
export class MongoRepositoryService implements OnModuleInit {
  private readonly logger = new Logger(MongoRepositoryService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private userFallback: DemoUser[] = [];
  private productFallback: SearchableProduct[] = [...demoProducts];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('MONGODB_URI');
    if (!uri) {
      this.userFallback = [await createDemoUser()];
      this.logger.log('MongoDB not configured, using in-memory seed data.');
      return;
    }

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(this.configService.get<string>('MONGODB_DB_NAME') ?? 'ctt_demo');

    const users = this.usersCollection();
    const products = this.productsCollection();

    await users.createIndex({ email: 1 }, { unique: true });
    await products.createIndex({ name: 1 });
    await products.createIndex({ category: 1 });
    await products.createIndex({ tags: 1 });

    const existingUser = await users.findOne({ email: 'demo@cttshop.com' });
    if (!existingUser) {
      await users.insertOne(await createDemoUser());
    }

    const existingProducts = await products.countDocuments();
    if (existingProducts === 0) {
      await products.insertMany(demoProducts);
    }
  }

  storageMode() {
    return this.db ? 'mongodb' : 'memory';
  }

  async findUserByEmail(email: string): Promise<DemoUser | null> {
    if (!this.db) {
      return this.userFallback.find((user) => user.email === email) ?? null;
    }

    return (await this.usersCollection().findOne({ email })) as DemoUser | null;
  }

  async findProducts(query: string): Promise<SearchableProduct[]> {
    const normalized = query.trim().toLowerCase();
    if (!this.db) {
      return this.productFallback.filter((product) =>
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

    return products.map((product) => ({
      id: String(product.id),
      name: String(product.name),
      category: String(product.category),
      price: Number(product.price),
      description: String(product.description),
      image: String(product.image),
      tags: Array.isArray(product.tags) ? product.tags.map((tag) => String(tag)) : []
    }));
  }

  async findProductById(id: string): Promise<SearchableProduct | null> {
    if (!this.db) {
      return this.productFallback.find((product) => product.id === id) ?? null;
    }

    return (await this.productsCollection().findOne({ id })) as SearchableProduct | null;
  }

  private usersCollection(): Collection {
    if (!this.db) {
      throw new Error('MongoDB is not configured.');
    }

    return this.db.collection(
      this.configService.get<string>('MONGODB_USERS_COLLECTION') ?? 'users'
    );
  }

  private productsCollection(): Collection {
    if (!this.db) {
      throw new Error('MongoDB is not configured.');
    }

    return this.db.collection(
      this.configService.get<string>('MONGODB_PRODUCTS_COLLECTION') ?? 'products'
    );
  }
}
