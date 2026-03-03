import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { SendOtpDto } from './dto/verification.dto';
import { SmsService } from 'src/service/sms.service';

@Injectable()
export class VerificationService {
  constructor(
    private redisService: RedisService,
    private SmsService: SmsService,
  ) {}

  private getMessage(password: string) {
    return `Fixoo platformasidan ro'yxatdan o'tish uchun tasdiqlash kodi: ${password}. Kodni hech kimga bermang`;
  }

  async sendOtp(payload: SendOtpDto) {
    const { phone } = payload;
    let key = 'reg_' + phone;
    const session = await this.redisService.get(key);

    if (session) {
      throw new HttpException(
        'Code already sent to user',
        HttpStatus.BAD_REQUEST,
      );
    }

    const password = Math.floor(100000 + Math.random() * 900000);
    await this.redisService.set(key, +password);

    await this.SmsService.sendSMS(this.getMessage(`${password}`), phone);

    return { message: 'Confirmation code sent' };
  }
}
