import { IsInt, IsOptional, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {

  @ApiProperty({ example: 'Mirsaid Abdullayev', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsPhoneNumber("UZ")
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'Uzbekistan', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;
}
