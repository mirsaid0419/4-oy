import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;
  onModuleInit() {
    this.client = new Redis({
      host: 'localhost',
      port:6379
    });
  }
  async set(key:string,value:number){
    this.client.set(key,value,"EX",120)
  }
  async get(key:string){
    return this.client.get(key)
  }
  async delete(key:string){
    return this.client.del(key)
  }
}
