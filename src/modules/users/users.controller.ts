import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAdminDto } from './dto/update-admin-dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { CreateAdminDto } from './dto/create-admin-dto';
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
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
        role: {
          type: 'string',
          enum: Object.values(Role),
          default: Role.user,
        },
        avatar: { type: 'string', format: 'binary' },
      },
      required: ['username', 'email', 'password'],
    },
  })
  @Post()
  create(
    @Body() createUserDto: CreateAdminDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.usersService.create(createUserDto, avatar);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get("all/users")
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get("all/admins")
  findAllAdmins() {
    return this.usersService.findAllAdmins();
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin} and himself ${Role.user}`,
  })
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
      },
      required: ['username', 'email', 'password'],
    },
  })
  @Patch('user/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
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
        role: {
          type: 'string',
          enum: Object.values(Role),
          default: Role.user,
        },
        avatar: { type: 'string', format: 'binary' },
      },
      required: ['username', 'email', 'password'],
    },
  })
  @Patch('admin/:id')
  updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.usersService.updateAdmin(+id, updateAdminDto);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin} and himself ${Role.user}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
