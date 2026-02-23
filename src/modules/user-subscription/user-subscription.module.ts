import { Module } from '@nestjs/common';
import { UserSubscriptionService } from './user-subscription.service';
import { UserSubscriptionController } from './user-subscription.controller';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';

@Module({
  controllers: [UserSubscriptionController],
  providers: [UserSubscriptionService],
  imports: [PrismaModule],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
