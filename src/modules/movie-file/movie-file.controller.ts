import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Headers,
  Res,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { MovieFileService } from './movie-file.service';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role, VideoQuality } from '@prisma/client';
import type { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/role';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiBearerAuth()
@ApiTags('movie-file')
@Controller('movie-file')
export class MovieFileController {
  constructor(private readonly movieFileService: MovieFileService) {}

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        movieId: { type: 'number' },
        quality: { type: 'string', enum: Object.values(VideoQuality) },
        language: { type: 'string', example: 'uz' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['movieId', 'quality', 'file'],
    },
  })
  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Post()
  create(
    @Body() createUserDto: CreateMovieFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.movieFileService.create(createUserDto, file);
  }

  @Get()
  findAll() {
    return this.movieFileService.findAll();
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin},${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin,Role.user)
  @Get('watch/:id')
  async watchVideo(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Req() req: Request,
    @Headers('range') range: string,
  ) {
    return this.movieFileService.watchFile(res, id, req['user'], range);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieFileService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovieFileDto: UpdateMovieFileDto,
  ) {
    return this.movieFileService.update(+id, updateMovieFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieFileService.remove(+id);
  }
}
