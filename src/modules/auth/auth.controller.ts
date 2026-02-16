import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { StaffLoginDto } from './dto/staff-login-dto';
import { CreateStaffDto } from '../staffs/dto/create-staff-dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiBearerAuth("token")
  @UseGuards(TokenGuard)
  @Post('staff/register')
  async StaffRegister(@Body() data: CreateStaffDto) {
    const result = await this.authService.StaffRegister(data);
    return {
      success: true,
      staff: result,
    };
  }

  @Post('staff/login')
  async StaffLogin(@Body() data: StaffLoginDto) {
    const result = await this.authService.StaffLogin(data);
    return {
      success: true,
      staff: result,
    };
  }
  // @Post("student")
  // async StudentRegister(@Body() data: RegisterStudentDto){
  //     const result = await this.authService.Register(data)
  // }
}
