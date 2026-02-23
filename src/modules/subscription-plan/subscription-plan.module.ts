import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';

@Module({
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
  imports:[PrismaModule]
})
export class SubscriptionPlanModule {}
