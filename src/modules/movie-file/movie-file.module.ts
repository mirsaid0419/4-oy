import { Module } from '@nestjs/common';
import { MovieFileService } from './movie-file.service';
import { MovieFileController } from './movie-file.controller';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';

@Module({
  controllers: [MovieFileController],
  providers: [MovieFileService],
  imports: [PrismaModule],
})
export class MovieFileModule {}
