import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher-dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { Role, Status } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaServise) {}
  async create(createTeacherDto: CreateTeacherDto) {
    return await this.prisma.teacher.create({ data: createTeacherDto });
  }

  async getAllArxiv() {
    const courses = await this.prisma.teacher.findMany({
      where: { staff: { status: Status.inactive, role: Role.teacher } },
    });
    return { success: true, data: courses };
  }

  async findAll() {
    return await this.prisma.teacher.findMany({
      where: {
        staff: {
          status: Status.active,
          role: Role.teacher,
        },
      },
    });
  }

  async findOne(id: string) {
    const user = this.prisma.teacher.findUnique({ where: { id } });
  }

  update(id: string, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: string) {
    return `This action removes a #${id} teacher`;
  }
}
