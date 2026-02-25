import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;
    
    @ApiProperty()
    @IsString()
    @IsOptional()
    @MaxLength(50)
    @Matches(/^[a-z0-9-]+$/, {
        message: "Slug faqat kichik harf, raqam va `-` dan iborat bo'lishi kerak",
    })
    slug?: string;
    
    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;
}
