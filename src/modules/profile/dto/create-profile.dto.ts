import {  IsOptional, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProfileDto {
  @ApiProperty({ example: 'Mirsaid Abduqulov', required: false })
  @Transform(({ value }) => (value === '' ? undefined : value)) //form data jo'natishda empty kelib qolsa "" bunday bo'lib kelar ekan maydonllar shuni to'g'irlaydi bu
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsPhoneNumber('UZ')
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'Uzbekistan', required: false })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;
}
