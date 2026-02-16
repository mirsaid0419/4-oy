import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role, Status } from '@prisma/client'; 
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({example:"Mirsaid"})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;
  
  @ApiProperty({example:"Abduqulov"})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;
  
  @ApiProperty({example:"mirsaid"})
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;
  
  @ApiProperty({example:"Ab123456!"})
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;
  
  @ApiProperty({example:Role.teacher})
  @IsEnum(Role)
  @IsOptional()
  role?: Role; 
  
  @ApiProperty({example:"O'quv bo'limi"})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;
  
  @ApiProperty({example:"+998951234567"})
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @IsPhoneNumber("UZ")
  phone?: string;
  
  @ApiProperty({example:"Toshkent,Chilonzor"})
  @IsString()
  @IsOptional()
  address?: string;
  
  @ApiProperty({example:Status.active})
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
