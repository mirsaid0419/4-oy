import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher-dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
@ApiBearerAuth('token')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}
  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get('arxiv')
  async allArxiv() {
    return await this.teachersService.getAllArxiv();
  }

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @ApiOperation({ summary: `${Role.superadmin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
