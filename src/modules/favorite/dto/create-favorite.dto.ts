import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({ example: 1, description: 'Kino ID raqami' })
  @IsInt()
  @IsNotEmpty()
  movieId: number;
}