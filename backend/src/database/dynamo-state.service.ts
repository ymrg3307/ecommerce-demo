import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { demoInventory } from '../data/demo-data';

export type SessionRecord = {
  sessionId: string;
  userId: string;
  email: string;
  issuedAt: string;
  expiresAt: string;
};

export type InventoryRecord = {
  productId: string;
  stockCount: number;
  status: 'IN_STOCK' | 'OUT_OF_STOCK';
};

@Injectable()
export class DynamoStateService implements OnModuleInit {
  private readonly logger = new Logger(DynamoStateService.name);
  private documentClient: DynamoDBDocumentClient | null = null;
  private readonly sessionFallback = new Map<string, SessionRecord>();
  private readonly inventoryFallback = new Map<string, InventoryRecord>(
    demoInventory.map((item) => [item.productId, item])
  );

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const endpoint = this.configService.get<string>('DYNAMODB_ENDPOINT');

    if (!region || !accessKeyId || !secretAccessKey) {
      this.logger.log('DynamoDB not configured, using in-memory sessions and inventory.');
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

  storageMode() {
    return this.documentClient ? 'dynamodb' : 'memory';
  }

  async getInventory(productId: string): Promise<InventoryRecord | null> {
    if (!this.documentClient) {
      return this.inventoryFallback.get(productId) ?? null;
    }

    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.inventoryTableName(),
        Key: { productId }
      })
    );

    return (result.Item as InventoryRecord | undefined) ?? null;
  }

  async createSession(record: SessionRecord): Promise<void> {
    if (!this.documentClient) {
      this.sessionFallback.set(record.sessionId, record);
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
      return this.sessionFallback.get(sessionId) ?? null;
    }

    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.sessionsTableName(),
        Key: { sessionId }
      })
    );

    return (result.Item as SessionRecord | undefined) ?? null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.documentClient) {
      this.sessionFallback.delete(sessionId);
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

  private inventoryTableName() {
    return this.configService.get<string>('DYNAMODB_INVENTORY_TABLE') ?? 'ctt-demo-inventory';
  }
}
