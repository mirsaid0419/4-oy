import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInDto } from './dto/create-auth.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { SecurityService } from 'src/common/security/security.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaServise,
    private readonly userServise: UsersService,
    private readonly secret: SecurityService,
  ) {}
  async register(data: CreateUserDto) {
    return await this.userServise.create(data);
  }
  async signIn(payload: SignInDto) {
    const userdata = await this.prisma.user.findUnique({
      where: { user_name: payload.user_name },
    });
    let existpass: boolean = false;
    if (userdata) {
      existpass = await this.secret.comparePassword(
        payload.password,
        userdata.password,
      );
    } else {
      throw new UnauthorizedException('User not found');
    }
    if (existpass) {
      const token = await this.secret.generateToken({
        id: userdata.id,
        name: userdata.name,
        email: userdata.email,
      });
      return {succes:true,token};
    } else {
      return { succes: false, message: 'User name or password error' };
    }
  }
}
