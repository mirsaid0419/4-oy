import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { SmsService } from './service/sms.service';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [RedisModule, UsersModule, VerificationModule],
  controllers: [AppController],
  providers: [AppService, SmsService],
})
export class AppModule { }

