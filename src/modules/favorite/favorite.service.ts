import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { Prisma, Role, SubscriptionType } from '@prisma/client';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createFavoriteDto: CreateFavoriteDto, userId: number) {
    const { movieId } = createFavoriteDto;

    const movieExists = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movieExists) {
      throw new NotFoundException(`ID-si ${movieId} bo'lgan kino topilmadi!`);
    }

    try {
      const favorite = await this.prisma.favorite.create({
        data: {
          userId: userId,
          movieId: movieId,
        },
        include: {
          movie: true,
        },
      });

      return {
        success: true,
        data: favorite,
      };

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Bu kino allaqachon sevimlilaringiz ro'yxatida mavjud!`);
        }
      }

      throw new InternalServerErrorException('Serverda xatolik yuz berdi');
    }
  }
  async findAll(user: any) {
    const userId = user.id;
    const isAdmin = user.role === Role.admin || user.role === Role.superadmin;

    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });

    const isPremium =
      activeSubscription?.plan.subscriptionType === SubscriptionType.premium;

    let movieCondition: any = {};
    if (!isPremium && !isAdmin) {
      movieCondition.subscriptionType = SubscriptionType.free;
    }

    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId: userId,
        movie: movieCondition,
      },
      include: {
        movie: true,
      },
    });

    return {
      success: true,
      data: favorites,
    };
  }

  async findOne(id: number) {
    return await this.prisma.favorite.findUnique({
      where: { id },
      include: {
        movie: true,
      },
    });
  }

  async remove(id: number) {
    return {
      success: true,
      data: await this.prisma.favorite.delete({
        where: { id },
      })
    };
  }
}
