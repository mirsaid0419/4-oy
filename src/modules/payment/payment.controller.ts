import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { CallbackDto } from './dto/callback';
@ApiBearerAuth()
@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Post('callback')
  async callback(@Body() body: CallbackDto) {
    return this.paymentService.markAsSuccess(+body.paymentId);
  }

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Post(':subscriptionId')
  create(@Param('subscriptionId', ParseIntPipe) id: number) {
    return this.paymentService.create(id);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Get('me')
  findOneSubscriptionsMe(@Req() req: Request) {
    return this.paymentService.findOneUserPayments(+req['user'].id);
  }
}
