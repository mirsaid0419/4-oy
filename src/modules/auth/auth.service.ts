import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaServise } from 'src/core/db/prisma.service';
import { StaffsService } from '../staffs/staffs.service';
import { CreateStaffDto } from '../staffs/dto/create-staff-dto';
import { StaffLoginDto } from './dto/staff-login-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaServise,
    private staffServi: StaffsService,
    private jwtServise: JwtService,
  ) {}
  async StaffRegister(payload: CreateStaffDto) {
    try {
      const result = await this.staffServi.create(payload);
      return { success: true, staff: result };
    } catch (error) {
      throw error;
    }
  }

  async StaffLogin(data: StaffLoginDto) {
    const user = await this.prisma.staff.findUnique({
      where: { username: data.username },
    });
    if (!user || !(await bcrypt.compare(data.password, user.password)))
      throw new UnauthorizedException();
    return {
      token: await this.jwtServise.signAsync({
        id: user.id,
        username: user.username,
        role: user.role,
      }),
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      role: user.role,
      position: user.position,
    };
  }
  async StudentLogin(data: StaffLoginDto) {
    const user = await this.prisma.student.findUnique({
      where: { username: data.username },
    });
    if (!user || !(await bcrypt.compare(data.password, user.password || '')))
      throw new UnauthorizedException();
    const { password, ...studentInfo } = user;
    return {
      token: await this.jwtServise.signAsync({
        id: user.id,
        username: user.username,
        role: studentInfo,
      }),
    };
  }
}
