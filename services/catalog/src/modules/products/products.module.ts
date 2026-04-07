import { Module } from '@nestjs/common';
import { MongoProductsService } from '../../database/mongo-products.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, MongoProductsService]
})
export class ProductsModule {}
