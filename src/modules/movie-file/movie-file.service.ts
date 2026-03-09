import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import axios from 'axios';

@Injectable()
export class MovieFileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(
    createMovieFileDto: CreateMovieFileDto,
    file: Express.Multer.File,
  ) {
    const language = createMovieFileDto.language?.trim().toLowerCase();

    let fileUrl: string;
    let filePublicId: string;
    try {
      const uploadResult = (await this.cloudinaryService.uploadFile(
        file,
        'imtixon/movies/videos',
      )) as { url: string; publicId: string };
      fileUrl = uploadResult.url;
      filePublicId = uploadResult.publicId;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cloudinary upload failed: ${error.message}`,
      );
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const movie = await prisma.movie.findUnique({
          where: { id: createMovieFileDto.movieId },
          select: { id: true },
        });
        if (!movie) {
          throw new NotFoundException('Movie not found');
        }
        const movieFile = await (prisma.movieFile as any).create({
          data: {
            movieId: +createMovieFileDto.movieId,
            fileUrl,
            filePublicId,
            quality: createMovieFileDto.quality,
            language: language,
          },
        });
        return movieFile;
      });
      return { success: true, data: result };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This quality and language already exists for this movie',
        );
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findAll(userId: number) {
    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'active',
        plan: {
          subscriptionType: { not: 'free' },
        },
      },
    });
    const hasPremium = !!activeSubscription;

    let whereCondition: any = {};
    if (!hasPremium) {
      whereCondition.subscriptionType = 'free';
    }
    const [movies, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where: whereCondition,
        include: {
          files: true,
          categories: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.movie.count({ where: whereCondition }),
    ]);

    return {
      success: true,
      data: movies,
    };
  }

  async watchFile(
    res: Response,
    id: number,
    req: { id: number },
    range?: string,
  ) {
    try {
      const data = await this.prisma.movieFile.findUnique({
        where: { id },
        include: { movie: true },
      });

      if (!data) {
        throw new NotFoundException('File not found');
      }

      const activeSubscriptions = await this.prisma.userSubscription.findMany({
        where: { userId: req.id, status: 'active' },
        include: { plan: true },
      });

      const hasPremiumSubscription = activeSubscriptions.some(
        (sub) => sub.plan.subscriptionType !== 'free',
      );

      if (
        data.movie.subscriptionType === 'premium' &&
        !hasPremiumSubscription
      ) {
        throw new BadRequestException(
          `Ushbu kinoni ko'rish uchun premium obuna talab qilinadi`,
        );
      }

      await this.prisma.movie.update({
        where: { id: data.movieId },
        data: { viewCount: { increment: 1 } },
      });

      const cloudinaryUrl = data.fileUrl;

      if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
        throw new NotFoundException('Video fayli Cloudinaryda topilmadi');
      }

      let fileSize: number;
      try {
        const headResponse = await axios.head(cloudinaryUrl);
        fileSize = parseInt(headResponse.headers['content-length'] || '0', 10);
      } catch {
        fileSize = 0;
      }

      if (range && fileSize > 0) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res.status(416).send('Requested range not satisfiable');
          return;
        }

        const chunkSize = end - start + 1;

        const axiosResponse = await axios.get(cloudinaryUrl, {
          responseType: 'stream',
          headers: { Range: `bytes=${start}-${end}` },
        });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
          'Cache-Control': 'no-cache',
        });

        axiosResponse.data.pipe(res);
      } else {
        const axiosResponse = await axios.get(cloudinaryUrl, {
          responseType: 'stream',
        });

        res.writeHead(200, {
          'Content-Type': 'video/mp4',
          ...(fileSize > 0 ? { 'Content-Length': fileSize } : {}),
        });

        axiosResponse.data.pipe(res);
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new NotFoundException('Faylni yuklashda xatolik yuz berdi');
    }
  }

  async findOne(id: number, userId: number) {
    const file = await this.prisma.movieFile.findUnique({
      where: { id },
      include: { movie: true },
    });

    if (!file) {
      throw new NotFoundException('Fayl topilmadi');
    }

    const activeSub = await this.prisma.userSubscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });

    const isPremiumUser = activeSub?.plan.subscriptionType !== 'free';

    if (file.movie.subscriptionType === 'premium' && !isPremiumUser) {
      throw new BadRequestException(
        `Bu faylni ko'rish uchun premium obuna kerak`,
      );
    }

    return file;
  }

  async update(id: number, dto: UpdateMovieFileDto) {
    const existingFile = await (this.prisma.movieFile as any).findUnique({
      where: { id },
    });

    if (!existingFile) {
      throw new NotFoundException(`ID: ${id} bo'lgan fayl topilmadi`);
    }

    return await (this.prisma.movieFile as any).update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const file = await (this.prisma.movieFile as any).findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`O'chirish uchun fayl topilmadi`);
    }

    if (file.filePublicId) {
      await this.cloudinaryService.deleteFile(file.filePublicId, 'video');
    }

    await this.prisma.movieFile.delete({
      where: { id },
    });

    return { success: true, message: `Fayl muvaffaqiyatli o'chirildi` };
  }
}
