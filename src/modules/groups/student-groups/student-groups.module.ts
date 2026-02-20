import { Module } from '@nestjs/common';
import { StudentGroupsService } from './student-groups.service';
import { StudentGroupsController } from './student-groups.controller';
import { PrismaModule } from 'src/core/db/prisma.module';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [StudentGroupsController],
  providers: [StudentGroupsService, PrismaServise],
  imports: [PrismaModule],
})
export class StudentGroupsModule {}
