import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService,PrismaServise],
})
export class RoomsModule {}
