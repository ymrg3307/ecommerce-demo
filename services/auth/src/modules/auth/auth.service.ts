import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { demoUser } from '../../data/demo-user';
import { DynamoSessionService } from '../../database/dynamo-session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dynamoSessionService: DynamoSessionService
  ) {}

  async login(email: string, password: string) {
    if (email !== demoUser.email || password !== demoUser.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const issuedAt = new Date();
    const ttlHours = Number(this.configService.get<string>('DEMO_SESSION_TTL_HOURS') ?? '12');
    const expiresAt = new Date(issuedAt.getTime() + ttlHours * 60 * 60 * 1000);
    const sessionId = uuid();

    await this.dynamoSessionService.createSession({
      sessionId,
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    return {
      token: sessionId,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role
      }
    };
  }

  async logout(token: string) {
    await this.dynamoSessionService.deleteSession(token);
    return { success: true };
  }

  async getSession(token: string) {
    const session = await this.dynamoSessionService.getRequiredSession(token);
    return {
      token,
      expiresAt: session.expiresAt,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role
      }
    };
  }
}
