import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService,PrismaServise],
})
export class GroupsModule {}
