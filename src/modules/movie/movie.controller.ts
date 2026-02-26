import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TokenGuard } from 'src/common/guards/token.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { PaginationDto } from './dto/paganation-movie.dto';

@ApiBearerAuth()
@ApiTags('movie')
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        releaseYear: { type: 'number' },
        durationMinutes: { type: 'number' },
        subscriptionType: {
          type: 'string',
          enum: ['free', 'premium'],
        },
        categoryIds: {
          type: 'array',
          items: { type: 'number' },
        },
        poster: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'releaseYear', 'durationMinutes'],
    },
  })
  @UseInterceptors(FileInterceptor('poster'))
  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFile() poster: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.movieService.create(createMovieDto, poster, req.user.id);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin},${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.user)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  async findAll(@Query() query: PaginationDto, @Req() req: any) {
    return this.movieService.findAll(query, req.user);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin},${Role.user}` })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin, Role.user)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.movieService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.admin, Role.superadmin)
  @ApiOperation({ summary: `${Role.superadmin},${Role.admin},${Role.user}` })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        releaseYear: { type: 'number' },
        durationMinutes: { type: 'number' },
        subscriptionType: {
          type: 'string',
          enum: ['free', 'premium'],
        },
        categoryIds: {
          type: 'array',
          items: { type: 'number' },
        },
        poster: {
          type: 'string',
          format: 'binary',
        },
      },

    },
  })
  @UseInterceptors(FileInterceptor('poster'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @UploadedFile() poster: Express.Multer.File,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.movieService.update(id, updateMovieDto, req['user'], poster);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.admin, Role.superadmin)
  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @ApiParam({ name: 'id', type: Number })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.delete(id);
  }
}
