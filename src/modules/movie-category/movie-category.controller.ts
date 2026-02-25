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
import { MovieCategoryService } from './movie-category.service';
import { CreateMovieCategoryDto } from './dto/create-movie-category.dto';
import { UpdateMovieCategoryDto } from './dto/update-movie-category.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TokenGuard } from 'src/common/guards/token.guard';
import { Roles } from 'src/common/decorators/role';
@ApiBearerAuth()
@ApiTags('movie-category')
@Controller('movie-category')
export class MovieCategoryController {
  constructor(private readonly movieCategoryService: MovieCategoryService) {}

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Post()
  create(@Body() createMovieCategoryDto: CreateMovieCategoryDto) {
    return this.movieCategoryService.create(createMovieCategoryDto);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get()
  findAll() {
    return this.movieCategoryService.findAll();
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieCategoryService.findOne(+id);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovieCategoryDto: UpdateMovieCategoryDto,
  ) {
    return this.movieCategoryService.update(+id, updateMovieCategoryDto);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieCategoryService.remove(+id);
  }
}
