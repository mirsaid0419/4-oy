import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/db/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma : PrismaService){}

  async create(createUserDto: CreateUserDto) {
    const result = await this.prisma.user.create({data:createUserDto})
    return {message:"user created"}
  }

  async findAll() {
    return await this.prisma.user.findMany()
  }

  async findOne(id: string) {
      const existuser=await this.prisma.user.findUnique({where:{id}})
      if(!existuser) throw new NotFoundException("User not found")
      return existuser
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existuser = await this.prisma.user.findUnique({ where: { id } });
    if (!existuser) throw new NotFoundException('User not found');
    
    return await this.prisma.user.update({where:{id},data:updateUserDto});
  }

  async remove(id: string) {
    const existuser = await this.prisma.user.findUnique({ where: { id } });
    if (!existuser) throw new NotFoundException('User not found');
    await this.prisma.user.delete({where:{id}})
    return {mesage:"User succes deleted"}
  }
}
