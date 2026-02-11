import { Injectable, ParseUUIDPipe } from '@nestjs/common';
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

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    try {
      const data = await this.prisma.user.findUnique({ where: { id } });
      const { password, ...result }: any = data;
      return { result };
    } catch (error) {}
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
