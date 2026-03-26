import { Global, Module } from '@nestjs/common';
import { MongoRepositoryService } from './mongo-repository.service';
import { DynamoStateService } from './dynamo-state.service';

@Global()
@Module({
  providers: [MongoRepositoryService, DynamoStateService],
  exports: [MongoRepositoryService, DynamoStateService]
})
export class DatabaseModule {}
