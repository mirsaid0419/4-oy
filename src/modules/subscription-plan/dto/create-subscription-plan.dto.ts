import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionType } from '@prisma/client';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Premium' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 0, description: `Free plan uchun 0 bo'ladi` })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: 30,
    description: `Free plan uchun null yoki 0 bo'lishi mumkin`,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  durationDays?: number;

  @ApiProperty({ enum: Object.values(SubscriptionType) })
  subscriptionType: SubscriptionType;

  @ApiPropertyOptional({
    example: { quality: 'HD', ads: false },
    description: 'Subscription plan features in JSON format',
  })
  @IsOptional()
  @IsObject()
  features?: any;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
