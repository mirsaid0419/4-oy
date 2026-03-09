import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';
import { UserSubscriptionModule } from '../user-subscription/user-subscription.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, UserSubscriptionModule, CloudinaryModule],
  exports: [UsersService]
})
export class UsersModule { }
