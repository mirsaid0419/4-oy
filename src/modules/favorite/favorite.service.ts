import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { Prisma, Role, SubscriptionType } from '@prisma/client';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) { }

  async toggle(createFavoriteDto: CreateFavoriteDto, userId: number) {
    const { movieId } = createFavoriteDto;

    const movieExists = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movieExists) {
      throw new NotFoundException(`Kino topilmadi!`);
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return {
        success: true,
        message: 'Sevimlilardan olib tashlandi',
        isFavorite: false,
      };
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        movieId,
      },
    });

    return {
      success: true,
      message: 'Sevimlilarga qo\'shildi',
      isFavorite: true,
      data: favorite,
    };
  }

  async findAll(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            categories: {
              include: { category: true }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: favorites,
    };
  }

  async checkFavorite(movieId: number, userId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: { userId, movieId }
      }
    });

    return {
      success: true,
      isFavorite: !!favorite
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.favorite.findUnique({
      where: { id },
      include: { movie: true },
    });
    if (!data) throw new NotFoundException('Topilmadi');
    return { success: true, data };
  }

  async remove(id: number) {
    await this.prisma.favorite.delete({ where: { id } });
    return {
      success: true,
      message: 'O\'chirildi'
    };
  }
}
