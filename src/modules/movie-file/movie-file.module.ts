import { Module } from '@nestjs/common';
import { MovieFileService } from './movie-file.service';
import { MovieFileController } from './movie-file.controller';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [MovieFileController],
  providers: [MovieFileService],
  imports: [PrismaModule, CloudinaryModule],
})
export class MovieFileModule { }
