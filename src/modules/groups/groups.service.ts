import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { GroupStatus } from '@prisma/client';
import { group } from 'console';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaServise) {}

  async create(createGroupDto: CreateGroupDto) {
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const existGroup = await this.prisma.groups.findFirst({
      where: { name: createGroupDto.name },
    });
    if (existGroup) throw new ConflictException('This group already added');

    const existCourse = await this.prisma.course.findFirst({
      where: { id: createGroupDto.course_id, status: 'active' },
    });
    if (!existCourse) throw new NotFoundException(`Course not found`);

    const existTeacher = await this.prisma.teacher.findUnique({
      where: { id: createGroupDto.teacher_id },
    });
    if (!existTeacher) throw new NotFoundException(`Teacher not found`);

    const room = await this.prisma.rooms.findFirst({
      where: { id: createGroupDto.room_id },
    });
    if (!room) throw new NotFoundException('Room not found');

    const startNew = timeToMinutes(createGroupDto.start_time);
    const endNew = startNew + existCourse.duration_hours * 60;

    const roomGroups = await this.prisma.groups.findMany({
      where: {
        room_id: createGroupDto.room_id,
        OR: [{ status: GroupStatus.active }, { status: GroupStatus.planned }],
      },
      select: {
        start_time: true,
        course: {
          select: {
            duration_hours: true,
          },
        },
      },
    });

    const RoomTime = roomGroups.some((el) => {
      const start = timeToMinutes(el.start_time);
      const end = start + el.course.duration_hours * 60;
      return start < endNew && end > startNew;
    });

    if (RoomTime) {
      throw new ConflictException('Room is already reserved');
    }

    await this.prisma.groups.create({
      data: {
        ...createGroupDto,
        start_date: new Date(createGroupDto.start_date),
      },
    });

    return {
      success: true,
      message: 'Group created',
    };
  }

  async getOneGroupStudents(id: string) {
    return {
      success: true,
      data: await this.prisma.studentGroup.findMany({
        where: { group_id: id },
      }),
    };
  }

  async findAll() {
    return { success: true, data: await this.prisma.groups.findMany() };
  }

  async findOne(id: string) {
    return {
      success: true,
      data: await this.prisma.groups.findUnique({ where: { id } }),
    };
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return {
      success: true,
      data: await this.prisma.groups.update({
        where: { id },
        data: updateGroupDto,
      }),
    };
  }

  async remove(id: string) {
    await this.prisma.groups.delete({
      where: { id },
    });
    return { success: true, message: 'Group deleted' };
  }
}
