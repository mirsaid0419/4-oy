import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { VerificationService } from './verification.service';
import { SmsService } from 'src/service/sms.service';

@Module({
  imports: [RedisModule,],
  controllers: [VerificationController],
  providers: [VerificationService, RedisService, SmsService],
})
export class VerificationModule {}
