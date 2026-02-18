import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { CreateStaffDto } from './dto/create-staff-dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailServise } from 'src/common/email/email.service';

@Injectable()
export class StaffsService {
  constructor(
    private prisma: PrismaServise,
    private readonly emailService: EmailServise,
  ) {}
  async create(createStaffDto: CreateStaffDto) {
    const existStaff = await this.prisma.staff.findUnique({
      where: { username: createStaffDto.username },
    });
    if (existStaff) throw new ConflictException('User name already added');
    const result = await this.prisma.staff.create({
      data: {
        ...createStaffDto,
        password: await bcrypt.hash(createStaffDto.password, 10),
      },
    });
    await this.emailService.sendEmail(
      createStaffDto.email,
      createStaffDto.password,
      createStaffDto.username,
    );
    return result;
  }

  async findAll() {
    return await this.prisma.staff.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.staff.findUnique({ where: { id } });
  }

  update(id: string, updateStaffDto: UpdateStaffDto) {
    return this.prisma.staff.update({ where: { id }, data: updateStaffDto });
  }

  remove(id: string) {
    return this.prisma.staff.delete({ where: { id } });
  }
}
