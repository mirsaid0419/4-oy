import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
@Injectable()
export class PrismaServise
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter, log: ['warn', 'error'] });
  }

  async onModuleDestroy() {
    this.$disconnect();
    Logger.log('❌ Prisma dis connect');
  }
  async onModuleInit() {
    this.$connect();
    Logger.log('✅ Prisma connected');
  }
}
