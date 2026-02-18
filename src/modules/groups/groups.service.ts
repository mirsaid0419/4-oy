import { ConflictException, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaServise } from 'src/core/db/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaServise) {}

  async create(createGroupDto: CreateGroupDto) {
    const existGroup = await this.prisma.groups.findFirst({
      where: { name: createGroupDto.name },
    });
    if (existGroup) throw new ConflictException('This group already added');
    const roomTimes = await this.prisma.groups.findMany({
      where: { room_id: createGroupDto.room_id },
    });
  }

  async getOneGroupStudents(id:string){
    const students=await this.prisma
  };

  findAll() {
    return `This action returns all groups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} group`;
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
}
