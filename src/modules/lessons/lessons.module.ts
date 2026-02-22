import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService,PrismaServise],
})
export class LessonsModule {}
