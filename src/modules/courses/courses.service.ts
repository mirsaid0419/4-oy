import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course-dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { Status } from '@prisma/client';
import { UpdateCourseDto } from './dto/update-course-dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaServise) {}
  
  async create(payload: CreateCourseDto) {
    const existCourse = await this.prisma.course.findUnique({
      where: { name: payload.name }
    });
    if (existCourse) throw new ConflictException('Course already added');
    await this.prisma.course.create({ data: payload });
    return { success: true, message: 'Course created' };
  }

  async getAll() {
    const courses = await this.prisma.course.findMany({
      where: { status: Status.active },
    });
    return { success: true, data: courses };
  }

  async getAllArxiv() {
    const courses = await this.prisma.course.findMany({
      where: { status: Status.inactive },
    });
    return { success: true, data: courses };
  }
  
  async getOne(id: string) {
    const courses = await this.prisma.course.findUnique({ where: { id } });
    return { success: true, data: courses };
  }

  async update(id: string, payload: UpdateCourseDto) {
    const existCourse = await this.prisma.course.findUnique({ where: { id } });
    if (!existCourse) throw new NotFoundException('Course not found');
    const newCourse = await this.prisma.course.update({
      where: { id },
      data: payload,
    });
    return { success: true, data: newCourse };
  }

  async delete(id: string) {
    const existCourse = await this.prisma.course.findUnique({ where: { id } });
    if (!existCourse) throw new NotFoundException('Course not found');
    await this.prisma.course.update({
      where: { id },
      data: { status: Status.inactive },
    });
    return { success: true, message: 'course success deleted' };
  }
}
