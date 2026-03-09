import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';
import { MovieCategoryModule } from '../movie-category/movie-category.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [PrismaModule, MovieCategoryModule, CloudinaryModule],
})
export class MovieModule { }
