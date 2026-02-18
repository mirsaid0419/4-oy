import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, PrismaServise],
  imports: [MailerModule],
})
export class StudentsModule {}
