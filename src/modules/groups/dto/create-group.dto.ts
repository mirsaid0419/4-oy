import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
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
  @IsNotEmpty()
  @IsUUID()
  course_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  teacher_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  room_id: string;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    example: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    type: [String],
  })
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
