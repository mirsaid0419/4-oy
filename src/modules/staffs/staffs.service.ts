import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffsService {
  constructor(private prisma: PrismaServise){}
  async create(createStaffDto: CreateStaffDto) {
    const existStaff=await this.prisma.staff.findUnique({where:{username:createStaffDto.username}})
    if(existStaff) throw new ConflictException("User name already added")
    const result = await this.prisma.staff.create({data:createStaffDto})
    return result
  }

  findAll() {
    return `This action returns all staffs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} staff`;
  }

  update(id: number, updateStaffDto: UpdateStaffDto) {
    return `This action updates a #${id} staff`;
  }

  remove(id: number) {
    return `This action removes a #${id} staff`;
  }
}
