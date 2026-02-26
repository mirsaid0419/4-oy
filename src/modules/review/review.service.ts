import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleRatingUpdate() {
    const grouped = await this.prisma.review.groupBy({
      by: ['movieId'],
      _avg: {
        rating: true,
      },
    });

    for (const item of grouped) {
      await this.prisma.movie.update({
        where: { id: item.movieId },
        data: {
          rating: item._avg.rating ?? 0,
        },
      });
    }
  }

  async create(createReviewDto: CreateReviewDto, userId: number) {
    const movieExists = await this.prisma.movie.findUnique({
      where: { id: createReviewDto.movieId },
    });
    if (!movieExists) {
      throw new NotFoundException(
        `ID-si ${createReviewDto.movieId} bo'lgan kino topilmadi!`,
      );
    }
    return await this.prisma.review.create({
      data: {
        userId: userId,
        movieId: createReviewDto.movieId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
    });
  }

  async findAll() {
    return await this.prisma.review.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.review.findUnique({ where: { id } });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    return await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.review.delete({ where: { id } });
  }
}
