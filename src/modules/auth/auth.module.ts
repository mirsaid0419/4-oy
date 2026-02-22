import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { PrismaService } from 'src/core/db/prisma/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService,UsersService,PrismaService],
  imports:[UsersModule]
})
export class AuthModule {}
