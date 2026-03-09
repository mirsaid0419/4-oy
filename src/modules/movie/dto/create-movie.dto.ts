import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SubscriptionType, VideoQuality } from '@prisma/client';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  releaseYear: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsEnum(SubscriptionType)
  subscriptionType?: SubscriptionType;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(Number);
    return value.split(',').map(Number);
  })
  @IsArray()
  @IsInt({ each: true })
  @ArrayUnique()
  categoryIds?: number[];

  @IsOptional()
  @IsEnum(VideoQuality)
  quality?: VideoQuality;

  @IsOptional()
  @IsString()
  language?: string;
}
