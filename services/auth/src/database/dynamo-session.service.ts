import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export type SessionRecord = {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  issuedAt: string;
  expiresAt: string;
};

@Injectable()
export class DynamoSessionService implements OnModuleInit {
  private readonly logger = new Logger(DynamoSessionService.name);
  private documentClient: DynamoDBDocumentClient | null = null;
  private readonly fallbackSessions = new Map<string, SessionRecord>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const endpoint = this.configService.get<string>('DYNAMODB_ENDPOINT');

    if (!region || !accessKeyId || !secretAccessKey) {
      this.logger.log('DynamoDB not configured, using in-memory sessions.');
      return;
    }

    const client = new DynamoDBClient({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken: this.configService.get<string>('AWS_SESSION_TOKEN') || undefined
      }
    });

    this.documentClient = DynamoDBDocumentClient.from(client);
  }

  async createSession(record: SessionRecord) {
    if (!this.documentClient) {
      this.fallbackSessions.set(record.sessionId, record);
      return;
    }

    await this.documentClient.send(
      new PutCommand({
        TableName: this.sessionsTableName(),
        Item: record
      })
    );
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    if (!this.documentClient) {
      return this.fallbackSessions.get(sessionId) ?? null;
    }

    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.sessionsTableName(),
        Key: { sessionId }
      })
    );

    return (result.Item as SessionRecord | undefined) ?? null;
  }

  async getRequiredSession(sessionId: string) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid session.');
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      await this.deleteSession(sessionId);
      throw new UnauthorizedException('Session expired.');
    }

    return session;
  }

  async deleteSession(sessionId: string) {
    if (!this.documentClient) {
      this.fallbackSessions.delete(sessionId);
      return;
    }

    await this.documentClient.send(
      new DeleteCommand({
        TableName: this.sessionsTableName(),
        Key: { sessionId }
      })
    );
  }

  private sessionsTableName() {
    return this.configService.get<string>('DYNAMODB_SESSIONS_TABLE') ?? 'ctt-demo-sessions';
  }
}
