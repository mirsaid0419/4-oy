import { Controller, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WatchHistoryService } from './watch-history.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UseGuards } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { Body, Delete, Get, Param, Post } from '@nestjs/common';
import { TokenGuard } from 'src/common/guards/token.guard';
import type { Request } from 'express';

@ApiBearerAuth()
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) { }
  @ApiOperation({
    summary: `${Role.user} ${Role.admin} ${Role.superadmin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user, Role.admin, Role.superadmin)
  @Post()
  create(
    @Req() req: Request,
    @Body() createWatchHistoryDto: CreateWatchHistoryDto,
  ) {
    return this.watchHistoryService.create(
      createWatchHistoryDto,
      Number(req['user']['id']),
    );
  }

  @ApiOperation({
    summary: `${Role.user} ${Role.admin} ${Role.superadmin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user, Role.admin, Role.superadmin)
  @Get()
  findAll(@Req() req: Request) {
    return this.watchHistoryService.findAll(Number(req['user']['id']));
  }

  @ApiOperation({
    summary: `${Role.user} ${Role.admin} ${Role.superadmin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user, Role.admin, Role.superadmin)
  @Get('movie/:movieId')
  findByMovie(
    @Req() req: Request,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    return this.watchHistoryService.findByMovie(
      Number(req['user']['id']),
      movieId,
    );
  }

  @ApiOperation({
    summary: `${Role.user} ${Role.admin} ${Role.superadmin}`,
  })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user, Role.admin, Role.superadmin)
  @Delete('delete/one/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.watchHistoryService.remove(id);
  }
}
