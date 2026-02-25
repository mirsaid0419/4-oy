import { Injectable } from '@nestjs/common';
import { CreateMovieCategoryDto } from './dto/create-movie-category.dto';
import { UpdateMovieCategoryDto } from './dto/update-movie-category.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/db/prisma/prisma.service';

@Injectable()
export class MovieCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMovieCategoryDto) {
    const { movieId, categoryIds } = dto;

    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    const uniqueCategoryIds = [...new Set(categoryIds)];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    
    const existingRelations = await this.prisma.movieCategory.findMany({
      where: {
        movieId,
        categoryId: { in: uniqueCategoryIds },
      },
    });
    if (categories.length !== uniqueCategoryIds.length) {
      throw new NotFoundException('One or more categories not found');
    }
    // console.log(existingRelations.length)
    // if (existingRelations.length > 0) {
    //   throw new BadRequestException(
    //     'Some categories already assigned to this movie',
    //   );
    // }

    const created = await this.prisma.movieCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        movieId,
        categoryId,
      })),
      skipDuplicates: true,
    });
    return {
      success: true,
      message: 'Categories assigned successfully',
      data: created,
    };
  }

  async findAll() {
    return { success: true, data: await this.prisma.movieCategory.findMany() };
  }

  async findOne(id: number) {
    return {
      success: true,
      data: await this.prisma.movieCategory.findUnique({ where: { id } }),
    };
  }

  async update(id: number, updateMovieCategoryDto: UpdateMovieCategoryDto) {
    return {
      success: true,
      data: await this.prisma.movieCategory.update({
        where: { id },
        data: updateMovieCategoryDto,
      }),
    };
  }

  async remove(id: number) {
    await this.prisma.movieCategory.delete({ where: { id } });
    return {success:true,message:"Category deleted"};
  }
}
