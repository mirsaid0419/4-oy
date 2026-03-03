import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(private redisService: RedisService) {}

  async create(payload: any) {
    const password = Math.floor(100000 + Math.random() * 900000);
    await this.redisService.set(payload.email, password);
    return { success: true, message: 'Otp code sent' };
  }
  async get(key: string) {
    return { success: true, data: await this.redisService.get(key) };
  }

  async delete(key: string) {
    await this.redisService.delete(key);
    return { success: true, message: 'Otp deleted' };
  }
}
