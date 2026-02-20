import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { EmailServise } from 'src/common/email/email.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaServise,
    private readonly emailService: EmailServise,
  ) {}
  async create(createStudentDto: CreateStudentDto) {
    const existStudent = await this.prisma.student.findFirst({
      where: {
        OR: [
          { username: createStudentDto.username },
          { email: createStudentDto.email },
        ],
      },
    });
    if (existStudent)
      throw new ConflictException('User name or email already added');
    const result = await this.prisma.student.create({
      data: {
        ...createStudentDto,
        password: await bcrypt.hash(createStudentDto.password, 10),
        birth_date: createStudentDto.birth_date
          ? new Date(createStudentDto.birth_date)
          : null,
      },
    });
    await this.emailService.sendEmail(
      createStudentDto.email,
      createStudentDto.password,
      createStudentDto.username,
    );
    return result;
  }

  async findAll() {
    return {
      success: true,
      data: await this.prisma.student.findMany({ where: { status: 'active' } }),
    };
  }

  async findOne(id: string) {
    return {
      success: true,
      data: await this.prisma.student.findFirst({ where: { id } }),
    };
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    return {
      success: true,
      data: await this.prisma.student.update({
        where: { id },
        data: updateStudentDto,
      }),
    };
  }

  async remove(id: string) {
    await this.prisma.student.delete({ where: { id } });
    return { success: true, message: 'Student success deleted' };
  }
}
