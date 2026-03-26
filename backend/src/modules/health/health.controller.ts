import { Controller, Get } from '@nestjs/common';
import { DynamoStateService } from '../../database/dynamo-state.service';
import { MongoRepositoryService } from '../../database/mongo-repository.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly mongoRepository: MongoRepositoryService,
    private readonly dynamoStateService: DynamoStateService
  ) {}

  @Get()
  health() {
    return {
      status: 'ok',
      services: {
        catalog: this.mongoRepository.storageMode(),
        sessionInventory: this.dynamoStateService.storageMode()
      }
    };
  }
}
