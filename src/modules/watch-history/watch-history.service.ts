import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';

@Injectable()
export class WatchHistoryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(payload: CreateWatchHistoryDto, userId: number) {
    const { movieId, watchedDuration } = payload;

    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    const totalSeconds = (movie?.durationMinutes || 0) * 60;
    const progressSeconds = watchedDuration || 0;
    const percentage = totalSeconds > 0 ? (progressSeconds / totalSeconds) * 100 : 0;

    // We calculate percentage if duration is provided, though usually it's better to keep raw seconds
    // For now, let's just record the entry
    const data = await this.prisma.watchHistory.upsert({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
      update: {
        watchedDuration: watchedDuration || 0,
        watchedPercentage: percentage,
        lastWatched: new Date(),
      },
      create: {
        userId,
        movieId,
        watchedDuration: watchedDuration || 0,
        watchedPercentage: percentage,
      },
      include: {
        movie: true
      }
    });

    return {
      success: true,
      message: 'Watch history updated',
      data,
    };
  }

  async findAll(userId: number) {
    const data = await this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        movie: true,
      },
    });

    return {
      success: true,
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.watchHistory.findFirst({
      where: { id },
      include: {
        user: true,
        movie: true
      }
    });

    if (!data) {
      throw new NotFoundException('Watch history not found');
    }

    return {
      success: true,
      data,
    };
  }

  async findByMovie(userId: number, movieId: number) {
    const data = await this.prisma.watchHistory.findFirst({
      where: { userId, movieId },
    });

    return {
      success: true,
      data: data || null,
    };
  }



  async remove(id: number) {
    const exist = await this.prisma.watchHistory.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException('Watch history not found');
    }

    await this.prisma.watchHistory.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Watch history deleted',
    };
  }
}