import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { PaymentStatus, SubscriptionType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) { }

  async markAsSuccess(paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        subscription: { select: { plan: true, status: true } },
        status: true,
        userSubscriptionId: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status === PaymentStatus.completed) {
      return { message: 'Payment already confirmed' };
    }
    if (payment.status !== PaymentStatus.pending) {
      throw new BadRequestException(
        `Faqat pending statusdagi paymentni tasdiqlash mumkin. Hozirgi status: ${payment.status}`,
      );
    }
    if (!payment.subscription) {
      throw new BadRequestException('Subscription not found');
    }
    if (payment.subscription.status === 'active') {
      throw new BadRequestException(
        `Ushbu obuna allaqachon faol holatda.`,
      );
    }

    const durationDays = payment.subscription?.plan?.durationDays;

    await this.prisma.$transaction(async (prisma) => {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.completed },
      });

      await prisma.userSubscription.update({
        where: { id: payment.userSubscriptionId },
        data: {
          status: 'active',
          startDate: new Date(),
          endDate: durationDays
            ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    });
    return { message: 'Subscription activated' };
  }
  async create(userSubscriptionId: number) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { id: userSubscriptionId },
      include: { plan: true },
    });

    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.status === 'active')
      throw new ConflictException('Subscription already active');
    if (subscription.status === 'expired')
      throw new BadRequestException('Subscription expired. Please renew.');
    if (subscription.plan.subscriptionType === SubscriptionType.free) {
      throw new BadRequestException(
        "Tekin obuna rejasi uchun to'lov yaratib bo'lmaydi",
      );
    }

    if (
      !subscription.plan?.price ||
      new Decimal(subscription.plan.price).lte(0)
    )
      throw new BadRequestException(
        "Premium reja uchun narx belgilanmagan yoki noto'g'ri",
      );
    if (!subscription.paymentMethod)
      throw new BadRequestException(
        'Payment method not set for this subscription',
      );

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userSubscriptionId,
        status: {
          in: [PaymentStatus.pending, PaymentStatus.completed],
        },
      },
    });
    if (existingPayment && (existingPayment.status == "completed" || existingPayment.status == "pending"))
      throw new ConflictException(`Payment already ${existingPayment.status}`);

    const fakeTransactionId = 'test_' + randomUUID();

    const payment = await this.prisma.payment.create({
      data: {
        userSubscriptionId,
        amount: subscription.plan.price,
        paymentMethod: subscription.paymentMethod,
        status: PaymentStatus.pending,
        externalTransactionId: fakeTransactionId,
        paymentDetails: {
          provider: 'TEST',
          note: 'This is a test payment',
        },
      },
    });

    return { success: true, data: payment };
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
        where: { subscription: { user: { id } } },
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
