import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';

@ApiBearerAuth()
@ApiTags('subscription-plan')
@Controller('subscription-plan')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Post()
  create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(createSubscriptionPlanDto);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin},${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.admin, Role.superadmin,Role.user)
  @Get("active")
  findAllActive() {
    return this.subscriptionPlanService.findAllActive();
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.admin, Role.superadmin)
  @Get("inactive")
  findAllInActive() {
    return this.subscriptionPlanService.findAllInActive();
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.admin, Role.superadmin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(+id);
  }

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionPlanDto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionPlanService.update(+id, updateSubscriptionPlanDto);
  }

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionPlanService.remove(+id);
  }
}
