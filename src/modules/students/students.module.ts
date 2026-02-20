import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { PrismaServise } from 'src/core/db/prisma.service';
import { EmailModule } from 'src/common/email/email.module';
import { EmailServise } from 'src/common/email/email.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, PrismaServise, EmailServise],
  imports: [EmailModule],
})
export class StudentsModule {}
