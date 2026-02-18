import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaServise } from 'src/core/db/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaServise,
    private readonly emailService: MailerService,
  ) {}
  async create(createStudentDto: CreateStudentDto) {
    const existStudent = await this.prisma.student.findUnique({
      where: { username: createStudentDto.username },
    });
    if (existStudent) throw new ConflictException('User name already added');
    const result = await this.prisma.student.create({
      data: {
        ...createStudentDto,
        password: await bcrypt.hash(createStudentDto.password, 10),
      },
    });
    await this.emailService.sendMail({
      to: createStudentDto.email,
      subject: 'CRM tizimiga kirish uchun login va parol',
      html: `<b>Login: ${createStudentDto.username},</b><br>
        <b>Paroll: ${createStudentDto.password}</b>`,
    });
    return result;
  }

  findAll() {
    return `This action returns all students`;
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
}
