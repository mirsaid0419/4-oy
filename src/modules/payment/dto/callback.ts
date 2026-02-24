import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CallbackDto {
  @ApiProperty({ example: 2 })
  @IsInt()
//   @Type(() => Number)
  paymentId: number;
}
