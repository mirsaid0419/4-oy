import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TokenGuard } from 'src/common/guards/token.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
@ApiBearerAuth('token')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
  
  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get('arxiv')
  async findAllArxiv() {
    return await this.roomsService.findAllArxiv();
  }

  @ApiOperation({
    summary: `${Role.superadmin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin)
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.findOne(id);
  }


  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @ApiOperation({
    summary: `${Role.superadmin},${Role.admin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.remove(id);
  }
}
