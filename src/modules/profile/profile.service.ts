import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createProfileDto: CreateProfileDto, id: number) {
    const existUser = await this.prisma.profile.findFirst({
      where: { userId: id },
    });
    if (!existUser) {
      const existPhone = await this.prisma.profile.findFirst({
        where: { phone: createProfileDto.phone },
      });
      if (existPhone) {
        throw new ConflictException('This phone number has been added before');
      }
      await this.prisma.profile.create({
        data: { ...createProfileDto, userId: id },
      });
      return { success: true, message: 'Profile success created' };
    }
    throw new ConflictException('This user Id has been added before');
  }

  async findAll() {
    return {
      succcess: true,
      data: await this.prisma.profile.findMany({
        select: {
          userId: true,
          fullName: true,
          phone: true,
          country: true,
          createdAt: true,
          user: { select: { avatarUrl: true } },
        },
      }),
    };
  }

  async findOne(id: number) {
    const existUser = await this.prisma.profile.findFirst({
      where: { userId: id },
      select: {
        userId: true,
        fullName: true,
        phone: true,
        country: true,
        createdAt: true,
        user: { select: { avatarUrl: true } },
      },
    });
    if (!existUser) throw new NotFoundException('Profile not found');
    return { success: true, data: existUser };
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    return {
      success: true,
      message: 'Profil success updated',
      data: await this.prisma.profile.update({
        where: { userId: id },
        data: updateProfileDto,
        select: {
          userId: true,
          fullName: true,
          phone: true,
          country: true,
          updated_at: true,
          user: { select: { avatarUrl: true } },
        },
      }),
    };
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
