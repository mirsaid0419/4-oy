import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService,PrismaServise],
  imports: [],
})
export class TeachersModule {}
