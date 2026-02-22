import { Module } from '@nestjs/common';
import { MovieFileService } from './movie-file.service';
import { MovieFileController } from './movie-file.controller';

@Module({
  controllers: [MovieFileController],
  providers: [MovieFileService],
})
export class MovieFileModule {}
