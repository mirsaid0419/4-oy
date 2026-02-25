import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateReviewDto {

  @ApiProperty({ example: 5, description: 'Movie ID raqami' })
  @IsInt()
  movieId: number;

  @ApiProperty({ example: 5, description: 'Rating' })
  @IsInt()
  rating: number;

  @ApiProperty({ example: 'Comment', description: 'Comment' })
  @IsString()
  @IsOptional() 
  comment?: string;

}
