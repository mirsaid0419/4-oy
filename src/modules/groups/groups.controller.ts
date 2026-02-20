import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
@ApiBearerAuth('token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupsService.create(createGroupDto);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get()
  async findAll() {
    return await this.groupsService.findAll();
  }

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get('one/group/students/:id')
  async getOneGroupStudents(@Param('id', ParseUUIDPipe) id: string) {
    return await this.groupsService.getOneGroupStudents(id);
  }

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.findOne(id);
  }

  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }
  @ApiOperation({ summary: `${Role.superadmin}, ${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.remove(id);
  }
}
