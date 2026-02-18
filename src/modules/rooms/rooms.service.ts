import { ConflictException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaServise) {}
  async create(createRoomDto: CreateRoomDto) {
    const existRoom = await this.prisma.rooms.findUnique({
      where: { name: createRoomDto.name },
    });
    if (existRoom) throw new ConflictException('Room already added');
    await this.prisma.rooms.create({ data: createRoomDto });
    return {
      success: true,
      message: 'Room created',
    };
  }

  async findAll() {
    return await this.prisma.rooms.findMany({
      where: { status: RoomStatus.active },
    });
  }

  async findAllArxiv() {
    return await this.prisma.rooms.findMany({
      where: { status: RoomStatus.inactive },
    });
  }

  async findOne(id: string) {
    return await this.prisma.rooms.findUnique({ where: { id } });
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    return await this.prisma.rooms.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async remove(id: string) {
    await this.prisma.rooms.update({
      where: { id },
      data: { status: RoomStatus.inactive },
    });
    return { success: true, message: 'Room success deleted' };
  }
}
