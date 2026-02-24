import { Module } from '@nestjs/common';
import { UserSubscriptionService } from './user-subscription.service';
import { UserSubscriptionController } from './user-subscription.controller';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  controllers: [UserSubscriptionController],
  providers: [UserSubscriptionService],
  imports: [PrismaModule, PaymentModule],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
