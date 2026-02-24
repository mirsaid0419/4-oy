import {
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  @Type(() => Number)
  userSubscriptionId: number;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsObject()
  paymentDetails?: any;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  externalTransactionId?: string;
}
