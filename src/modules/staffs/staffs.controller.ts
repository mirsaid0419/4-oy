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
import { StaffsService } from './staffs.service';
import { CreateStaffDto } from './dto/create-staff-dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';

@Controller('staffs')
@ApiBearerAuth('token')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    const result = this.staffsService.create(createStaffDto);
    return { success: true, staff: result };
  }

  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Get()
  async findAll() {
    const result = await this.staffsService.findAll();
    return { success: true, count: result.length, staffs: result };
  }
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffsService.findOne(id);
  }
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffsService.update(id, updateStaffDto);
  }
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffsService.remove(id);
  }
}
