import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService,],
  imports:[UsersModule,PrismaModule]
})
export class AuthModule {}
