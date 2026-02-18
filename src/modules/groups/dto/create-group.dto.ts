import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Day } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsUUID()
  teacher_id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsUUID()
  room_id: string;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    example: Day.Monday,
  })
  @IsEnum(Day)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  week_day: string[];

  @ApiProperty({ example: '18:00' })
  @IsMilitaryTime()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  max_students: number;
}
