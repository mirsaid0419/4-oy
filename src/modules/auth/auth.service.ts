import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userServise: UsersService){}
  async register(data: CreateUserDto) {
    await this.userServise.create(data)
  }
  async signIn(payload:SignInDto) {
    const userdata=await this.userServise.findOne(payload.user_name)
  }
}
