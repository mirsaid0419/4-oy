import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';
import { UserSubscriptionModule } from '../user-subscription/user-subscription.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, UserSubscriptionModule],
  exports: [UsersService]
})
export class UsersModule { }
