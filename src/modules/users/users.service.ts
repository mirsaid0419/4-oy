import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { SecurityService } from 'src/common/security/security.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaServise,
    private secret: SecurityService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    createUserDto.password = await this.secret.hashPassword(
      createUserDto.password,
    );

    const newUser = await this.prisma.user.create({ data: createUserDto });
    const token = await this.secret.generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
    return { success: true, token };
  }

  async findAll() {
    const alldata = await this.prisma.user.findMany({
      select: { id: true, email: true, user_name: true },
    });
    if (alldata.length) {
      return { success: true, data: alldata };
    }
    return { success: false, messga: 'Users empty' };
  }

  async findOne(id: string) {
    const data = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, user_name: true },
    });
    if (data) {
      return { succes: true, data };
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userdata = await this.prisma.user.findUnique({ where: { id } });
    if (userdata) {
      const existdata = Object.keys(updateUserDto).every(
        (key) => userdata[key] == updateUserDto[key],
      );
      if (existdata) {
        const newUser = await this.prisma.user.update({
          where: { id },
          data: updateUserDto,
        });
        const token = await this.secret.generateToken({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        });
        return { success: true, token };
      } else {
        throw new BadRequestException('There is an update');
      }
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async remove(id: string) {
    const userdata = await this.prisma.user.findUnique({ where: { id } });
    if (userdata) {
      await this.prisma.user.delete({ where: { id } });
      return { success: true };
    } else {
      throw new NotFoundException('User not found');
    }
  }
}
