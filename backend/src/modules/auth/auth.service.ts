import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { DynamoStateService } from '../../database/dynamo-state.service';
import { MongoRepositoryService } from '../../database/mongo-repository.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly mongoRepository: MongoRepositoryService,
    private readonly dynamoStateService: DynamoStateService,
    private readonly configService: ConfigService
  ) {}

  async login(email: string, password: string) {
    const user = await this.mongoRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const sessionId = uuid();
    const issuedAt = new Date();
    const ttlHours = Number(this.configService.get<string>('DEMO_SESSION_TTL_HOURS') ?? '12');
    const expiresAt = new Date(issuedAt.getTime() + ttlHours * 60 * 60 * 1000);

    await this.dynamoStateService.createSession({
      sessionId,
      userId: user.id,
      email: user.email,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    return {
      token: sessionId,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async logout(token: string) {
    await this.dynamoStateService.deleteSession(token);
    return { success: true };
  }
}
