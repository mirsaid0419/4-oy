import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @ApiProperty()
  group_id: string;
  
  @IsString()
  @ApiProperty()
  topic: string;
  
  @IsString()
  @ApiProperty()
  description: string;
}
