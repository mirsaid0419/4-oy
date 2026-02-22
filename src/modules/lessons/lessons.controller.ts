import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';
@ApiBearerAuth('token')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}
  @ApiOperation({
    summary: `${Role.superadmin}, ${Role.admin}, ${Role.teacher}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.superadmin, Role.teacher)
  @Post()
  create(@Body() createLessonDto: CreateLessonDto, @Req() req: Request) {
    return this.lessonsService.create(createLessonDto, req['user']);
  }

  @ApiOperation({
    summary: `${Role.superadmin}, ${Role.admin},${Role.teacher}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.teacher)
  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @ApiOperation({
    summary: `${Role.superadmin}, ${Role.admin},${Role.teacher}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.teacher)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @ApiOperation({
    summary: `${Role.superadmin}, ${Role.admin}, ${Role.teacher}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.teacher)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @ApiOperation({
    summary: `${Role.superadmin}, ${Role.admin}, ${Role.teacher}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.teacher)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
