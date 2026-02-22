import { Module } from '@nestjs/common';
import { MovieCategoryService } from './movie-category.service';
import { MovieCategoryController } from './movie-category.controller';

@Module({
  controllers: [MovieCategoryController],
  providers: [MovieCategoryService],
})
export class MovieCategoryModule {}
