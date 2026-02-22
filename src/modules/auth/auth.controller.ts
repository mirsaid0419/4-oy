import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { StaffLoginDto } from './dto/staff-login-dto';
import { CreateStaffDto } from '../staffs/dto/create-staff-dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, Status } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';

@ApiBearerAuth('token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string', example: 'Mirsaid' },
        last_name: { type: 'string', example: 'Abduqulov' },
        username: { type: 'string', example: 'mirsaid' },
        password: { type: 'string', example: 'ab1234556!' },
        role: {
          type: 'string',
          enum: Object.values(Role),
          default: Role.teacher,
        },
        position: {
          type: 'string',
          enum: [
            "O'quv bo'limi",
            'Marketing',
            "Boshqaruv bo'limi",
            "HR bo'limi",
          ],
          default: "O'quv bo'limi",
        },
        phone: { type: 'string', example: '998' },
        address: { type: 'string', example: 'Toshkent' },
        status: {
          type: 'string',
          enum: Object.values(Status),
          default: Status.active,
        },
        email: { type: 'string', example: '@gmail.com' },
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'src', 'uploads'),
        filename: (req, file, cb) => {
          const name = Date.now() + '_image_' + extname(file.originalname);
          cb(null, name);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new Error('Faqat rasm formatlari (.jpg, .png) ruxsat etilgan!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @Post('staff/register')
  async StaffRegister(
    @Body() data: CreateStaffDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.authService.StaffRegister({
      ...data,
      photo: file ? file.filename : null,
    });
    return {
      success: true,
      message: 'Login and password send email',
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
  @Post('staff/login')
  async StudentLogin(@Body() data: StaffLoginDto) {
    const result = await this.authService.StudentLogin(data);
    return {
      success: true,
      staff: result,
    };
  }
}
