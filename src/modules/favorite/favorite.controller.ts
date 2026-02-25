import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TokenGuard } from 'src/common/guards/token.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';

@ApiBearerAuth()
@ApiTags('favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) { }

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto,
    @Req() req: Request) {
    return this.favoriteService.create(createFavoriteDto, req["user"]["id"]);
  }

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Get("my/all")
  findAll(@Req() req: Request) {
    return this.favoriteService.findAll(req["user"]["id"]);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin},${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.user)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoriteService.findOne(+id);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoriteService.remove(+id);
  }
}
