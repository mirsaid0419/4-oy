import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateAdminDto } from '../users/dto/create-admin-dto';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { UserLoginDto } from './dto/user-login-dto';
import { Roles } from 'src/common/decorators/role';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'Mirsaid' },
        email: {
          type: 'string',
          format: 'email',
          example: '@gmail.com',
        },
        password: { type: 'string', example: '123456' },
        avatar: { type: 'string', format: 'binary' },
      },
      required: ['username', 'email', 'password', 'avatar'],
    },
  })
  @Post('user/register')
  userRegister(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.authService.userRegister(createUserDto, avatar);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'Mirsaid' },
        email: {
          type: 'string',
          format: 'email',
          example: '@gmail.com',
        },
        password: { type: 'string', example: '123456' },
        avatar: { type: 'string', format: 'binary' },
        role: {
          type: 'string',
          enum: Object.values(Role),
          default: Role.admin,
        },
      },
      required: ['username', 'email', 'password', 'avatar'],
    },
  })

  @Post('admin/register')
  adminRegister(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.authService.adminRegister(createAdminDto, avatar);
  }
 
  @ApiConsumes('application/x-www-form-urlencoded') //swaggerdan json malumotlarni form data ko'rinishida kiritish kodi
  @Post('login')
  login(@Body() payload: UserLoginDto) {
    return this.authService.login(payload);
  }

  @ApiOperation({ summary: 'Verify current session' })
  @UseGuards(TokenGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.authService.getMe(req.user.id);
    return {
      success: true,
      user
    };
  }
}
