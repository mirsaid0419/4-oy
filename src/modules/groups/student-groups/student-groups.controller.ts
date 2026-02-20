import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StudentGroupsService } from './student-groups.service';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { FindAllStudentGroupDto } from './dto/querry-dto';
@ApiBearerAuth('token')
@Controller('student-groups')
export class StudentGroupsController {
  constructor(private readonly studentGroupsService: StudentGroupsService) {}

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Post()
  create(@Body() createStudentGroupDto: CreateStudentGroupDto) {
    return this.studentGroupsService.create(createStudentGroupDto);
  }

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @Roles(Role.superadmin, Role.admin)
  @Get()
  findAll(@Query() query: FindAllStudentGroupDto) {
    return this.studentGroupsService.findAll(query);
  }

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @Roles(Role.superadmin, Role.admin)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentGroupsService.findOne(id);
  }

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @Roles(Role.superadmin, Role.admin)
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateStudentGroupDto,
  ) {
    return this.studentGroupsService.update(id, payload);
  }

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @Roles(Role.superadmin, Role.admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.studentGroupsService.remove(id);
  }
}
