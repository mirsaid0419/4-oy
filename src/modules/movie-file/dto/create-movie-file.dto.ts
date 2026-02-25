import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { VideoQuality } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateMovieFileDto {
  @Type(() => Number)
  @IsInt()
  movieId: number;

  @IsEnum(VideoQuality)
  quality: VideoQuality;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  language?: string;
}
