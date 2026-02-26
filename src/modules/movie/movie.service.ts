import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import slugify from 'slugify';
import { mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { PaginationDto } from './dto/paganation-movie.dto';
import { unlinkSync, existsSync } from 'fs';
import { MovieCategoryService } from '../movie-category/movie-category.service';
import { Role, SubscriptionType } from '@prisma/client';

@Injectable()
export class MovieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly movieCategory: MovieCategoryService,
  ) { }

  async create(
    createMovieDto: CreateMovieDto,
    poster?: Express.Multer.File,
    userId?: number,
  ) {
    if (
      !createMovieDto.title ||
      !createMovieDto.releaseYear ||
      !createMovieDto.durationMinutes
    ) {
      throw new BadRequestException(
        'Title, releaseYear, and durationMinutes are required',
      );
    }
    let categoriesConnect: { categoryId: number }[] = [];
    if (createMovieDto.categoryIds?.length) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: createMovieDto.categoryIds } },
      });

      if (categories.length !== createMovieDto.categoryIds.length) {
        throw new NotFoundException('One or more categories not found');
      }

      categoriesConnect = createMovieDto.categoryIds.map((id) => ({
        categoryId: id,
      }));
    }

    let posterUrl: string | null = null;
    if (poster) {
      const fileName = `${Date.now()}_poster_${extname(poster.originalname)}`;
      const uploadPath = join(process.cwd(), 'src', 'uploads', 'movies');
      mkdirSync(uploadPath, { recursive: true });
      writeFileSync(join(uploadPath, fileName), poster.buffer);
      posterUrl = fileName;
    }

    const slug = slugify(createMovieDto.title, { lower: true, strict: true });

    const movie = await this.prisma.movie.create({
      data: {
        title: createMovieDto.title,
        slug,
        description: createMovieDto.description,
        releaseYear: createMovieDto.releaseYear,
        durationMinutes: createMovieDto.durationMinutes,
        posterUrl,
        subscriptionType: createMovieDto.subscriptionType || 'free',
        createdBy: userId || 0,
        categories: categoriesConnect.length
          ? { create: categoriesConnect }
          : undefined,
      },
      include: {
        categories: true,
      },
    });
    // if (createMovieDto.categoryIds){
    //   await this.movieCategory.create({
    //     movieId: movie.id,
    //     categoryIds: createMovieDto.categoryIds,
    //   });
    // }
    return { success: true, data: movie };
  }

  async findAll(query: PaginationDto, user: any) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);

    const userId = user.id;
    const isAdmin = user.role === Role.admin || user.role === Role.superadmin;

    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });

    const isPremium =
      activeSubscription?.plan.subscriptionType === SubscriptionType.premium;

    let whereCondition: any = {};

    if (!isPremium && !isAdmin) {
      whereCondition.subscriptionType = SubscriptionType.free;
    }

    const cleanSearch =
      typeof query?.search === 'string' ? query?.search.trim() : '';

    if (cleanSearch.length > 0) {
      const searchSlug = slugify(cleanSearch, {
        lower: true,
        strict: true,
      });

      whereCondition.slug = {
        contains: searchSlug,
        mode: 'insensitive',
      };
    }

    const skip = (page - 1) * limit;

    const [movies, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: { include: { category: true } },
          files: true,
        },
      }),
      this.prisma.movie.count({ where: whereCondition }),
    ]);

    return {
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: movies,
    };
  }

  async findOne(id: number, user: any) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid movie id');
    }

    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        files: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const isAdmin = user.role === Role.admin || user.role === Role.superadmin;

    if (movie.subscriptionType === SubscriptionType.premium && !isAdmin) {
      const activeSubscription = await this.prisma.userSubscription.findFirst({
        where: { userId: user.id, status: 'active' },
        include: { plan: true },
      });

      const isPremium =
        activeSubscription?.plan.subscriptionType === SubscriptionType.premium;

      if (!isPremium) {
        throw new ForbiddenException(
          'This movie is only available for premium subscribers',
        );
      }
    }

    return {
      success: true,
      data: movie,
    };
  }

  async update(
    id: number,
    updateMovieDto: UpdateMovieDto,
    user: any,
    poster?: Express.Multer.File,
  ) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid movie id');
    }

    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    if (movie.createdBy !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You cannot update this movie');
    }

    let slug: string | undefined;
    if (updateMovieDto.title) {
      slug = slugify(updateMovieDto.title, { lower: true, strict: true });

      const existSlug = await this.prisma.movie.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existSlug) {
        throw new BadRequestException('Movie with this title already exists');
      }
    }

    let categoriesUpdate;
    if (updateMovieDto.categoryIds) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: updateMovieDto.categoryIds } },
      });

      if (categories.length !== updateMovieDto.categoryIds.length) {
        throw new NotFoundException('One or more categories not found');
      }

      categoriesUpdate = {
        deleteMany: {},
        create: updateMovieDto.categoryIds.map((id) => ({
          categoryId: id,
        })),
      };
    }

    let posterUrl = movie.posterUrl;

    if (poster) {
      if (movie.posterUrl) {
        const oldPath = join(
          process.cwd(),
          'src',
          'uploads',
          'movies',
          movie.posterUrl,
        );

        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
        }
      }

      const fileName = `${Date.now()}_poster_${extname(poster.originalname)}`;

      const uploadPath = join(process.cwd(), 'src', 'uploads', 'movies');
      mkdirSync(uploadPath, { recursive: true });
      writeFileSync(join(uploadPath, fileName), poster.buffer);

      posterUrl = fileName;
    }

    const updatedMovie = await this.prisma.movie.update({
      where: { id },
      data: {
        title: updateMovieDto.title ?? undefined,
        slug: slug ?? undefined,
        description: updateMovieDto.description ?? undefined,
        releaseYear: updateMovieDto.releaseYear ?? undefined,
        durationMinutes: updateMovieDto.durationMinutes ?? undefined,
        subscriptionType: updateMovieDto.subscriptionType ?? undefined,
        posterUrl,
        categories: categoriesUpdate,
      },
      include: {
        categories: true,
        files: true,
      },
    });

    return {
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie,
    };
  }

  async delete(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid movie id');
    }

    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        files: true,
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.movieFile.deleteMany({
        where: { movieId: id },
      });

      await prisma.movieCategory.deleteMany({
        where: { movieId: id },
      });

      await prisma.movie.delete({
        where: { id },
      });
    });

    if (movie.posterUrl) {
      const posterPath = join(
        process.cwd(),
        'src',
        'uploads',
        'movies',
        movie.posterUrl,
      );

      if (existsSync(posterPath)) {
        unlinkSync(posterPath);
      }
    }

    for (const file of movie.files) {
      const videoPath = join(
        process.cwd(),
        'src',
        'uploads',
        'movies',
        'videos',
        file.fileUrl,
      );

      if (existsSync(videoPath)) {
        unlinkSync(videoPath);
      }
    }

    return {
      success: true,
      message: 'Movie deleted successfully',
    };
  }
}
