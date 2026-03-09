import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateWatchHistoryDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  movieId: number;

  @ApiProperty({ example: 120, required: false })
  @IsInt()
  @IsOptional()
  watchedDuration?: number;
}