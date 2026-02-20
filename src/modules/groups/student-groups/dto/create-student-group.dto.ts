import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStudentGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group_id: string;
}
