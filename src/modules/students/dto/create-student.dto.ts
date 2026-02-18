import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { StudentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'Mirsaid' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ example: 'Abduqulov' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @ApiProperty({ example: 'mirsaid' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'teshavoy@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ab123456!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @ApiProperty({ example: '+998951234567' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @IsPhoneNumber('UZ')
  phone?: string;

  @ApiProperty({ example: 'Toshkent,Chilonzor' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: StudentStatus.active })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo?: string | any;
}
