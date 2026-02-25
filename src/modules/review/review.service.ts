import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) { }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleRaitingUpdate() {
    const reviews = await this.prisma.review.findMany({
      select: {
        movieId: true,
        rating: true,
      },
    });
    const movieIds = reviews.map((review) => review.movieId);
    const movies = await this.prisma.movie.findMany({
      where: {
        id: {
          in: movieIds,
        },
      },
    });

    movies.forEach(movie => {
      const rating = reviews.filter((review) => review.movieId == movie.id)
      .reduce((acc, review) => acc + review.rating, 0);
      this.prisma.movie.update({
        where: { id: movie.id },
        data: { rating: rating / reviews.length },
      });
    })

  }

  async create(createReviewDto: CreateReviewDto, userId: number) {
    const movieExists = await this.prisma.movie.findUnique({
      where: { id: createReviewDto.movieId },
    });
    if (!movieExists) {
      throw new NotFoundException(`ID-si ${createReviewDto.movieId} bo'lgan kino topilmadi!`);
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
