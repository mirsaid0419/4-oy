import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports:[PrismaModule],
  exports:[PaymentService]
})
export class PaymentModule {}
