import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course-dto';
import { CoursesService } from './courses.service';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TokenGuard } from 'src/common/guards/token.guard';
import { Roles } from 'src/common/decorators/role';
@ApiBearerAuth('token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly courseServise: CoursesService) {}

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get()
  async getAll() {
    return await this.courseServise.getAll();
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get('arxiv')
  async allArxiv() {
    return await this.courseServise.getAllArxiv();
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.courseServise.getOne(id);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Post()
  async create(@Body() payload: CreateCourseDto) {
    return await this.courseServise.create(payload);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: CreateCourseDto,
  ) {
    return await this.courseServise.update(id, payload);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.courseServise.delete(id);
  }
}
