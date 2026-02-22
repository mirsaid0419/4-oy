import { Injectable } from '@nestjs/common';
import { CreateMovieCategoryDto } from './dto/create-movie-category.dto';
import { UpdateMovieCategoryDto } from './dto/update-movie-category.dto';

@Injectable()
export class MovieCategoryService {
  create(createMovieCategoryDto: CreateMovieCategoryDto) {
    return 'This action adds a new movieCategory';
  }

  findAll() {
    return `This action returns all movieCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} movieCategory`;
  }

  update(id: number, updateMovieCategoryDto: UpdateMovieCategoryDto) {
    return `This action updates a #${id} movieCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} movieCategory`;
  }
}
