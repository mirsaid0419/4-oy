import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { PrismaServise } from 'src/core/db/prisma.service';
import { PrismaModule } from 'src/core/db/prisma.module';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService,PrismaServise],
  imports:[PrismaModule]
})
export class GroupsModule {}
