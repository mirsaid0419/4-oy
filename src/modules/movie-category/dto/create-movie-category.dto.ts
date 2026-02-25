import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, ArrayUnique, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieCategoryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  movieId: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  categoryIds: number[];
}
