import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StaffsService } from '../staffs/staffs.service';
import { StaffsModule } from '../staffs/staffs.module';
import { PrismaServise } from 'src/core/db/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService,PrismaServise,StaffsService],
  imports: [StaffsModule]
})
export class AuthModule {}
