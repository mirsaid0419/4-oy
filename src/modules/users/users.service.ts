import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { extname, join } from 'path';
import * as bcrypt from 'bcrypt';
import { mkdirSync, writeFileSync } from 'fs';
import { JwtService } from '@nestjs/jwt';
import { Role, SubscriptionStatus } from '@prisma/client';
import { UpdateAdminDto } from './dto/update-admin-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { UserSubscriptionService } from '../user-subscription/user-subscription.service';
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}
  async create(createUserDto: CreateAdminDto, avatar: Express.Multer.File) {
    return this.prisma.$transaction(async (prisma) => {
      const existUser = await prisma.user.findFirst({
        where: {
          OR: [
            {
              username: createUserDto.username,
            },
            {
              email: createUserDto.email,
            },
          ],
        },
      });
      if (existUser)
        throw new BadRequestException('User name or email already exist');
      if (avatar) {
        const file_name = Date.now() + '_image_' + extname(avatar.originalname);
        createUserDto.avatarUrl = file_name;
        const uploadPath = join(process.cwd(), 'src', 'uploads');
        mkdirSync(uploadPath, { recursive: true });
        writeFileSync(join(uploadPath, file_name), avatar.buffer);
      }
      const data = await prisma.user.create({
        data: {
          ...createUserDto,
          password: await bcrypt.hash(createUserDto.password, 10),
        },
        select: { id: true, username: true, role: true, createdAt: true }
      });


      // await prisma.userSubscription.create({
      //   data: {
      //     userId: data.id,
      //     planId: 2,
      //     status: SubscriptionStatus.active,
      //     autoRenew: false,
      //     startDate: new Date(),
        // },
      // });
      return {
        success: true,
        message: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
        data,
      };
    });
  }

  async findAllUsers() {
    return {
      success: true,
      data: await this.prisma.user.findMany({ where: { role: Role.user } }),
    };
  }

  async findAllAdmins() {
    return {
      success: true,
      data: await this.prisma.user.findMany({
        where: { OR: [{ role: Role.admin }, { role: Role.superadmin }] },
      }),
    };
  }

  async findOne(id: number) {
    return {
      success: true,
      data: await this.prisma.user.findFirst({ where: { id } }),
    };
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    return {
      success: true,
      message: 'User data success updated',
      newUserData: await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: { username: true, role: true, avatarUrl: true },
      }),
    };
  }

  async updateAdmin(id: number, updateAdminDto: UpdateAdminDto) {
    return {
      success: true,
      message: 'Admin data success updated',
      newAdminData: await this.prisma.user.update({
        where: { id },
        data: updateAdminDto,
      }),
    };
  }

  async remove(id: number) {
    await this.prisma.user.update({ where: { id }, data: { isDeleted: true } });
    return { success: true, message: 'user success deleted' };
  }
}
