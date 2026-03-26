import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoStateService } from '../../database/dynamo-state.service';
import { MongoRepositoryService } from '../../database/mongo-repository.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly mongoRepository: MongoRepositoryService,
    private readonly dynamoStateService: DynamoStateService
  ) {}

  async search(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const products = await this.mongoRepository.findProducts(trimmed);
    return Promise.all(
      products.map(async (product) => {
        const inventory = await this.dynamoStateService.getInventory(product.id);
        return {
          ...product,
          inventory
        };
      })
    );
  }

  async getById(id: string) {
    const product = await this.mongoRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const inventory = await this.dynamoStateService.getInventory(id);
    return {
      ...product,
      inventory
    };
  }
}
