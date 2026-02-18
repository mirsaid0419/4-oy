import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService,PrismaServise]
})
export class CoursesModule {}
