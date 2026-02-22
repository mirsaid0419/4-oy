import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class FindAllStudentGroupDto {
  @IsEnum(Status)
  @IsNotEmpty()
  @ApiPropertyOptional({
    enum: Status,
    enumName: 'Status',
  })
  status: Status;
}
