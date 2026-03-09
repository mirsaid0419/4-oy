import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) { }

  @Cron(CronExpression.EVERY_MINUTE)
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
    const { movieId, rating, comment } = createReviewDto;

    const movieExists = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movieExists) {
      throw new NotFoundException(`Kino topilmadi!`);
    }

    // Upsert review: one per user per movie
    const review = await this.prisma.review.upsert({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      },
      update: {
        rating,
        comment
      },
      create: {
        userId,
        movieId,
        rating,
        comment
      }
    });

    // Manually trigger rating update for this movie for immediate feedback (optional)
    await this.updateMovieRating(movieId);

    return {
      success: true,
      data: review
    };
  }

  async updateMovieRating(movieId: number) {
    const stats = await this.prisma.review.aggregate({
      where: { movieId },
      _avg: { rating: true }
    });

    await this.prisma.movie.update({
      where: { id: movieId },
      data: { rating: stats._avg.rating ?? 0 }
    });
  }

  async findAll() {
    const data = await this.prisma.review.findMany({
      include: {
        user: { select: { username: true, avatarUrl: true } },
        movie: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  }

  async findByMovieId(movieId: number) {
    const data = await this.prisma.review.findMany({
      where: { movieId },
      include: {
        user: { select: { username: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.prisma.review.findUnique({
      where: { id },
      include: { user: true, movie: true }
    });
    if (!data) throw new NotFoundException('Topilmadi');
    return { success: true, data };
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const data = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
    });
    return { success: true, data };
  }

  async remove(id: number) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Topilmadi');

    await this.prisma.review.delete({ where: { id } });
    await this.updateMovieRating(review.movieId);

    return { success: true, message: 'O\'chirildi' };
  }
}
