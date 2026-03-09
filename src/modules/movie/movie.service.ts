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
import { PaginationDto } from './dto/paganation-movie.dto';
import { MovieCategoryService } from '../movie-category/movie-category.service';
import { Role, SubscriptionType, VideoQuality } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MovieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly movieCategory: MovieCategoryService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(
    createMovieDto: CreateMovieDto,
    poster?: Express.Multer.File,
    video?: Express.Multer.File,
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

    if (!userId) {
      throw new BadRequestException('User ID is required to create a movie');
    }

    const slug = slugify(createMovieDto.title, { lower: true, strict: true });
    const existing = await this.prisma.movie.findFirst({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Movie with this title already exists');
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

    // Upload poster to Cloudinary
    let posterUrl: string | null = null;
    let posterPublicId: string | null = null;

    if (poster) {
      const uploadResult = (await this.cloudinaryService.uploadFile(
        poster,
        'imtixon/movies/posters',
      )) as { url: string; publicId: string };
      posterUrl = uploadResult.url;
      posterPublicId = uploadResult.publicId;
    }

    // Upload video to Cloudinary if provided
    let videoUrl: string | null = null;
    let videoPublicId: string | null = null;

    if (video) {
      const uploadVideoResult = (await this.cloudinaryService.uploadFile(
        video,
        'imtixon/movies/videos',
      )) as { url: string; publicId: string };
      videoUrl = uploadVideoResult.url;
      videoPublicId = uploadVideoResult.publicId;
    }

    const movie = await this.prisma.$transaction(async (prisma) => {
      const newMovie = await (prisma.movie as any).create({
        data: {
          title: createMovieDto.title,
          slug,
          description: createMovieDto.description,
          releaseYear: createMovieDto.releaseYear,
          durationMinutes: createMovieDto.durationMinutes,
          posterUrl,
          posterPublicId,
          subscriptionType: createMovieDto.subscriptionType || 'free',
          createdBy: userId,
          categories: categoriesConnect.length
            ? { create: categoriesConnect }
            : undefined,
        },
        include: {
          categories: true,
        },
      });

      if (videoUrl && createMovieDto.quality) {
        await (prisma.movieFile as any).create({
          data: {
            movieId: newMovie.id,
            fileUrl: videoUrl,
            filePublicId: videoPublicId,
            quality: createMovieDto.quality,
            language: createMovieDto.language || 'uz',
          },
        });
      }

      return newMovie;
    });

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

    const movie = await (this.prisma.movie as any).findUnique({
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
    let posterPublicId = movie.posterPublicId;

    if (poster) {
      if (movie.posterPublicId) {
        await this.cloudinaryService.deleteFile(movie.posterPublicId);
      }

      const uploadResult = (await this.cloudinaryService.uploadFile(
        poster,
        'imtixon/movies/posters',
      )) as { url: string; publicId: string };
      posterUrl = uploadResult.url;
      posterPublicId = uploadResult.publicId;
    }

    const updatedMovie = await (this.prisma.movie as any).update({
      where: { id },
      data: {
        title: updateMovieDto.title ?? undefined,
        slug: slug ?? undefined,
        description: updateMovieDto.description ?? undefined,
        releaseYear: updateMovieDto.releaseYear ?? undefined,
        durationMinutes: updateMovieDto.durationMinutes ?? undefined,
        subscriptionType: updateMovieDto.subscriptionType ?? undefined,
        posterUrl,
        posterPublicId,
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

    const movie = await (this.prisma.movie as any).findUnique({
      where: { id },
      include: {
        files: true,
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    for (const file of movie.files) {
      if (file.fileUrl && file.fileUrl.startsWith('http')) {
        const publicId = (file as any).filePublicId;
        if (publicId) {
          await this.cloudinaryService.deleteFile(publicId, 'video');
        }
      }
    }

    if (movie.posterPublicId) {
      await this.cloudinaryService.deleteFile(movie.posterPublicId);
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

    return {
      success: true,
      message: 'Movie deleted successfully',
    };
  }
}
