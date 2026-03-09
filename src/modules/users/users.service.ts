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
  ) { }
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
          profile: {
            create: {} // This creates an empty profile record automatically
          }
        },
        include: {
          profile: true,
          subscriptions: { include: { plan: true } }
        }
      });

      const { password, ...userWithoutPassword } = data;
      return {
        success: true,
        message: 'Account success created',
        user: userWithoutPassword
      };


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
    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return {
      success: true,
      data: await this.prisma.user.findFirst({ where: { id } }),
    };
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto, avatar?: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (avatar) {
      if (user.avatarUrl) {
        const oldAvatarPath = join(process.cwd(), 'src', 'uploads', user.avatarUrl);
        const { existsSync, unlinkSync } = require('fs');
        if (existsSync(oldAvatarPath)) unlinkSync(oldAvatarPath);
      }

      const fileName = `${Date.now()}_avatar${extname(avatar.originalname)}`;
      const uploadPath = join(process.cwd(), 'src', 'uploads');
      mkdirSync(uploadPath, { recursive: true });
      writeFileSync(join(uploadPath, fileName), avatar.buffer);
      updateUserDto.avatarUrl = fileName;
    }

    const { fullName, phone, country, ...userData } = updateUserDto;

    const updated = await this.prisma.user.update({
      where: { id },
      data: userData as any,
      include: { profile: true },
    });

    if (fullName || phone || country) {
      await this.prisma.profile.upsert({
        where: { userId: id },
        update: { fullName, phone, country },
        create: { userId: id, fullName, phone, country },
      });
    }

    const finalUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true, role: true, avatarUrl: true, createdAt: true,
        profile: { select: { fullName: true, phone: true, country: true } }
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: finalUser,
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

  async demoteAdmin(id: number) {
    await this.prisma.user.update({
      where: { id },
      data: { role: Role.user },
    });
    return { success: true, message: 'Admin muvaffaqiyatli foydalanuvchiga aylantirildi' };
  }

  async toggleStatus(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return {
      success: true,
      data: updated,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`
    };
  }

  async remove(id: number) {
    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
    return { success: true, message: 'User successfully deleted' };
  }
}
