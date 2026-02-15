import { Module } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [StaffsController],
  providers: [StaffsService,PrismaServise],
  exports: [StaffsService]
})
export class StaffsModule {}
