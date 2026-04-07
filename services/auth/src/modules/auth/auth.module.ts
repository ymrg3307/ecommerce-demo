import { Module } from '@nestjs/common';
import { DynamoSessionService } from '../../database/dynamo-session.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DynamoSessionService]
})
export class AuthModule {}
