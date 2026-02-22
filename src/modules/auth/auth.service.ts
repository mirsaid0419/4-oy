import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateAdminDto } from '../users/dto/create-admin-dto';
import { UserLoginDto } from './dto/user-login-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly jwt: JwtService,
  ) {}
  async userRegister(payloa: CreateUserDto, avatar: Express.Multer.File) {
    return await this.userService.create(payloa, avatar);
  }

  async adminRegister(payload: CreateAdminDto, avatar: Express.Multer.File) {
    return await this.userService.create(payload, avatar);
  }

  async login(payload: UserLoginDto) {
    const data = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        username: true,
        role: true,
        avatarUrl: true,
        password: true,
        subscriptions: {
          select: { plan: { select: { name: true } }, endDate: true },
        },
      },
    });

    if (data) {
      if (await bcrypt.compare(payload.password, data?.password)) {
        const { password, ...user } = data;
        return {
          success: true,
          data: await this.jwt.signAsync(user),
        };
      }
    }
    throw new BadRequestException('User name or password error ');
  }
}
