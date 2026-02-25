import { Module } from '@nestjs/common';
import { MovieCategoryService } from './movie-category.service';
import { MovieCategoryController } from './movie-category.controller';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';

@Module({
  controllers: [MovieCategoryController],
  providers: [MovieCategoryService],
  imports: [PrismaModule],
  exports:[MovieCategoryService]
})
export class MovieCategoryModule {}
