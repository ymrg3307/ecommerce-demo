import { Injectable } from '@nestjs/common';
import { MongoProductsService } from '../../database/mongo-products.service';

@Injectable()
export class ProductsService {
  constructor(private readonly mongoProductsService: MongoProductsService) {}

  search(keyword: string) {
    return this.mongoProductsService.search(keyword);
  }

  getById(id: string) {
    return this.mongoProductsService.getById(id);
  }
}
