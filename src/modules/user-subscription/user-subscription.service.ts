import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { SubscriptionStatus, SubscriptionType } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserSubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredSubscriptions() {
    const now = new Date();

    const expired = await this.prisma.userSubscription.updateMany({
      where: {
        status: SubscriptionStatus.active,
        endDate: {
          lt: now,
        },
      },
      data: {
        status: SubscriptionStatus.expired,
      },
    });

    if (expired.count > 0) {
      console.log(`${expired.count} subscription expired`);
    }
    // console.log('Updated:', expired.count);
  }

  async create(
    createUserSubscriptionDto: CreateUserSubscriptionDto,
    user: { id: number },
  ) {
    const existPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: createUserSubscriptionDto.planId, isActive: true },
    });
    if (!existPlan) throw new BadRequestException('This plan not found');

    const plan = await this.prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        planId: createUserSubscriptionDto.planId,
        // status: SubscriptionStatus.active,
      },
    });

    if (plan) {
      throw new BadRequestException('You have this subscription');
    }

    const startDate = new Date();
    if (existPlan.subscriptionType == SubscriptionType.free) {
      return {
        success: true,
        data: await this.prisma.userSubscription.create({
          data: {
            userId: user.id,
            planId: createUserSubscriptionDto.planId,
            status: 'active',
            startDate,
            endDate: null,
          },
        }),
      };
    }

    const data = await this.prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: createUserSubscriptionDto.planId,
        paymentMethod: createUserSubscriptionDto.paymentMethod,
        status: "pending_payment",
        autoRenew: createUserSubscriptionDto.autoRenew ?? false,
      },
    });
    // await this.paymentService.create(data.id);
    return { success: true, data };
  }

  async findAllActive() {
    return {
      success: true,
      data: await this.prisma.userSubscription.findMany({
        where: { status: 'active' },
      }),
    };
  }
  async findAllExpired() {
    return {
      success: true,
      data: await this.prisma.userSubscription.findMany({
        where: { status: 'expired' },
      }),
    };
  }

  async findOneSubscriptionsMe(id: number) {
    const subscription = await this.prisma.userSubscription.findFirst({
      where: { userId: id, status: SubscriptionStatus.active },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: subscription,
    };
  }

  async findOneSubscriptionsUser(id: number) {
    return {
      success: true,
      data: await this.prisma.userSubscription.findMany({
        where: { userId: id, status: 'active' },
      }),
    };
  }

  async updateOneSubscriptionMe(
    id: number,
    updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    const existUser = await this.prisma.userSubscription.findFirst({
      where: { userId: id },
    });
    if (existUser) {
      return {
        success: true,
        data: await this.prisma.userSubscription.update({
          where: { id: existUser.id },
          include: { plan: true },
          data: updateUserSubscriptionDto,
        }),
      };
    }
    throw new NotFoundException('This subscription not found');
  }

  async updateOneSubscriptionUser(
    id: number,
    updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    const existUser = await this.prisma.userSubscription.findFirst({
      where: { userId: id },
    });
    if (existUser) {
      return {
        success: true,
        data: await this.prisma.userSubscription.update({
          where: { id: existUser.id },
          data: updateUserSubscriptionDto,
        }),
      };
    }
    throw new NotFoundException('This subscription not found');
  }

  async remove(id: number) {
    const existSubscription = await this.prisma.userSubscription.findFirst({
      where: { id },
    });
    if (existSubscription) {
      await this.prisma.userSubscription.delete({
        where: { id: existSubscription.id },
      });
      return {
        success: true,
        message: 'Subscription deleted',
      };
    }
    throw new NotFoundException('This subscription not found');
  }
}
