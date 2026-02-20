import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { FindAllStudentGroupDto } from './dto/querry-dto';
import { Status } from '@prisma/client';

@Injectable()
export class StudentGroupsService {
  constructor(private readonly prisma: PrismaServise) {}
  async create(createStudentGroupDto: CreateStudentGroupDto) {
    const existGroup = await this.prisma.groups.findFirst({
      where: { id: createStudentGroupDto.group_id },
    });
    if (!existGroup) throw new NotFoundException('Group not found');

    const existStudent = await this.prisma.student.findFirst({
      where: { id: createStudentGroupDto.student_id },
    });
    if (!existStudent) throw new NotFoundException('Student not found');

    const countStudent = await this.prisma.studentGroup.findMany({
      where: { group_id: createStudentGroupDto.group_id },
    });
    if (
      countStudent.some(
        (el) => el.student_id == createStudentGroupDto.student_id,
      )
    )
      throw new ConflictException('Student already added');

    if (existGroup.max_students <= countStudent.length)
      throw new ConflictException('Group full');

    return {
      success: true,
      data: await this.prisma.studentGroup.create({
        data: createStudentGroupDto,
      }),
    };
  }

  async findAll(query: FindAllStudentGroupDto) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    return await this.prisma.studentGroup.findMany({
      where,
      select: {
        id: true,
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            photo: true,
            address: true,
            birth_date: true,
            status: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            start_date: true,
            week_day: true,
            start_time: true,
            max_students: true,
            status: true,
            staff: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                photo: true,
                address: true,
                status: true,
              },
            },
            course: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration_month: true,
                duration_hours: true,
                level: true,
                status: true,
              },
            },
            rooms: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const studentGroup = await this.prisma.studentGroup.findFirst({
      where: { id },
      select: {
        id: true,
        students: {
          select: {
            id: true,
            first_name: true,
            status: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            staff: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                photo: true,
                status: true,
              },
            },
            course: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            rooms: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!studentGroup) {
      throw new NotFoundException('Student group not found');
    }
    return {
      success: true,
      data: studentGroup,
    };
  }

  async update(id, payload) {
    const studentGroup = await this.prisma.studentGroup.findFirst({
      where: {
        student_id: payload.student_id,
        group_id: payload.group_id,
      },
    });

    if (studentGroup) {
      throw new ConflictException('Student group already exists');
    }
    const student = await this.prisma.student.findFirst({
      where: {
        id: payload.student_id,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const group = await this.prisma.groups.findFirst({
      where: {
        id: payload.group_id,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    await this.prisma.studentGroup.update({
      where: { id },
      data: payload,
    });
    return {
      success: true,
      message: 'Student group updated successfully',
    };
  }

  async remove(id) {
    const studentGroup = await this.prisma.studentGroup.findUnique({
      where: { id },
    });
    if (studentGroup) {
      throw new NotFoundException('Student group not found');
    }
    await this.prisma.studentGroup.update({
      where: { id },
      data: {
        status: Status.inactive,
      },
    });
    return {
      success: true,
      message: 'Student group deleted successfully',
    };
  }
}
