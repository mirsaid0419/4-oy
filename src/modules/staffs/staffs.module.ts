import { Module } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { PrismaServise } from 'src/core/db/prisma.service';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { EmailServise } from 'src/common/email/email.service';
import { EmailModule } from 'src/common/email/email.module';

@Module({
  controllers: [StaffsController],
  imports:[EmailModule],
  providers: [StaffsService,PrismaServise,],
  exports: [StaffsService]
}) 
export class StaffsModule {}
