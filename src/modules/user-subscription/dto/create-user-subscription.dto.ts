import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsInt, IsOptional, IsBoolean, IsString } from 'class-validator';

export class CreateUserSubscriptionDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  planId: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiProperty({ enum: PaymentMethod })
  @IsOptional()
  @IsString()
  paymentMethod?: PaymentMethod;
}
