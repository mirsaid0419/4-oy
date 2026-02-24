import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async markAsSuccess(paymentId: number) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.completed },
    });

    await this.prisma.userSubscription.update({
      where: { id: payment.userSubscriptionId },
      data: {
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
      },
    });

    return { message: 'Subscription activated' };
  }

  async create(userSubscriptionId: number) {
    const existSubscription = await this.prisma.userSubscription.findUnique({
      where: { id: userSubscriptionId },
      include: { plan: true },
    });

    if (!existSubscription) {
      throw new NotFoundException(
        'You do not have an order for this subscription.',
      );
    }

    const existPayment = await this.prisma.payment.findFirst({
      where: { userSubscriptionId },
    });
    if (
      existPayment &&
      (existPayment.status == 'completed' || existPayment.status == 'pending')
    ) {
      throw new ConflictException('Payment pending or completed');
    }
    // if (existSubscription.status !== 'pending_payment') {
    //   throw new BadRequestException('Subscription already processed');
    // }

    if (!existSubscription.plan.price) {
      throw new BadRequestException('Plan price not set');
    }
    const fakeTransactionId = 'test_' + randomUUID();
    const payment = await this.prisma.payment.create({
      data: {
        userSubscriptionId: userSubscriptionId,
        amount: existSubscription.plan.price,
        paymentMethod: existSubscription.paymentMethod!,
        status: PaymentStatus.pending,
        externalTransactionId: fakeTransactionId,
        paymentDetails: {
          provider: 'TEST',
          note: 'This is a test payment',
        },
      },
    });
    return {
      success: true,
      data: payment,
    };
  }

  async findAll() {
    return { success: true, data: await this.prisma.payment.findMany() };
  }

  async findOne(id: number) {
    return {
      success: true,
      data: await this.prisma.payment.findUnique({ where: { id } }),
    };
  }

  async findOneUserPayments(id: number) {
    return {
      success: true,
      data: await this.prisma.payment.findMany({
        select: {
          subscription: {
            select: {
              id: true,
              user: { select: { username: true } },
              plan: { select: { name: true, price: true } },
              startDate: true,
              endDate: true,
              status: true,
              paymentMethod: true,
            },
          },
        },
      }),
    };
  }
}
