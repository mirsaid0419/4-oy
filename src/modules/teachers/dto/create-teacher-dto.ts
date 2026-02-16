import { IsString, IsNotEmpty, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'staff-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({ example: 'Web dasturlash' })
  @IsString()
  @IsNotEmpty()
  specialization: string;

  @ApiProperty({ example: 'Oliy' })
  @IsString()
  @IsNotEmpty()
  education: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  experience: number;
}
