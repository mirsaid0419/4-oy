import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserSubscriptionDto {

  @ApiProperty({ example: 2 })
  @IsInt()
  planId: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}