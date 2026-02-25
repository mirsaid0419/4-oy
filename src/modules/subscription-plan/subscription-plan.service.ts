import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';

@Injectable()
export class SubscriptionPlanService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    createSubscriptionPlanDto.name = createSubscriptionPlanDto.name
      .trim()
      .toLowerCase();
    return {
      success: true,
      data: await this.prisma.subscriptionPlan.create({
        data: createSubscriptionPlanDto,
      }),
    };
  }

  async findAllActive() {
    return {
      success: true,
      data: await this.prisma.subscriptionPlan.findMany({
        where: { isActive: true },
      }),
    };
  }

  async findAllInActive() {
    return {
      success: true,
      data: await this.prisma.subscriptionPlan.findMany({
        where: { isActive: false },
      }),
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.subscriptionPlan.findFirst({
      where: { id },
    });
    if (!data) throw new NotFoundException('Plan not found');
    return { success: true, data };
  }

  async update(
    id: number,
    updateSubscriptionPlanDto: UpdateSubscriptionPlanDto,
  ) {
    const data = await this.prisma.subscriptionPlan.findFirst({
      where: { id },
    });
    if (!data) throw new NotFoundException('Plan not found');

    if (updateSubscriptionPlanDto.name) {
      updateSubscriptionPlanDto.name=updateSubscriptionPlanDto.name.trim().toLocaleLowerCase();
    }
    return {
      success: true,
      data: await this.prisma.subscriptionPlan.update({
        where: { id },
        data: updateSubscriptionPlanDto,
      }),
    };
  }

  async remove(id: number) {
    const data = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!data) throw new NotFoundException('Plan not found');
    await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true, message: 'Plan deleted' };
  }
}
