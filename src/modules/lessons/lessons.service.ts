import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Role, Status } from '@prisma/client';
import { PrismaServise } from 'src/core/db/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaServise) {}
  async create(
    createLessonDto: CreateLessonDto,
    req: { id: string; role: Role },
  ) {
    const existGroup = await this.prisma.groups.findFirst({
      where: { id: createLessonDto.group_id },
    });

    if (req.role == 'teacher' && existGroup?.teacher_id != req.id)
      throw new BadRequestException('Bu guruxga siz vazifa berolmaysiz');
    if (!existGroup) throw new NotFoundException('Group not found');
    // await this.prisma.lesson.create({
    // data: {
    //   ...createLessonDto,
    //   teacher_id: req.role == 'teacher' ? req.id : null,
    //   staff_id: req.role != 'teacher' ? req.id : null,
    // },
    // });
    return {
      success: true,
      message: 'Lesson created',
    };
  }

  async findAll() {
    return { success: true, data: await this.prisma.lesson.findMany({where:{status:"active"}}) };
  }

  async findOne(id: string) {
    return {
      success: true,
      data: await this.prisma.lesson.findFirst({ where: { id } }),
    };
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    return {
      success: true,
      data: await this.prisma.lesson.update({
        where: { id },
        data: updateLessonDto,
      }),
    };
  }

  async remove(id: string) {
    return {
      success: true,
      data: await this.prisma.lesson.delete({ where: { id } }),
    };
  }
}
