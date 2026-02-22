import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MovieFileService } from './movie-file.service';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';

@Controller('movie-file')
export class MovieFileController {
  constructor(private readonly movieFileService: MovieFileService) {}

  @Post()
  create(@Body() createMovieFileDto: CreateMovieFileDto) {
    return this.movieFileService.create(createMovieFileDto);
  }

  @Get()
  findAll() {
    return this.movieFileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieFileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieFileDto: UpdateMovieFileDto) {
    return this.movieFileService.update(+id, updateMovieFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieFileService.remove(+id);
  }
}
