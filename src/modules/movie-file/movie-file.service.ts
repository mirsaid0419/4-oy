import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';
import { extname, join } from 'path';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Injectable()
export class MovieFileService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createMovieFileDto: CreateMovieFileDto,
    file: Express.Multer.File,
  ) {
    const language = createMovieFileDto.language?.trim().toLowerCase();
    const file_name = Date.now() + '_video_' + extname(file.originalname);
    const uploadPath = join(process.cwd(), 'src', 'uploads', 'videos');
    mkdirSync(uploadPath, { recursive: true });
    writeFileSync(join(uploadPath, file_name), file.buffer);
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const movie = await prisma.movie.findUnique({
          where: { id: createMovieFileDto.movieId },
          select: { id: true },
        });
        if (!movie) {
          throw new NotFoundException('Movie not found');
        }
        const movieFile = await prisma.movieFile.create({
          data: {
            movieId: +createMovieFileDto.movieId,
            fileUrl: file_name,
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

  async findAll() {
    return { success: true, data: await this.prisma.movieFile.findMany() };
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

      const videoPath = join(
        process.cwd(),
        'src',
        'uploads',
        'videos',
        `${data.fileUrl}`,
      );

      const videoStat = statSync(videoPath);
      const fileSize = videoStat.size;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = createReadStream(videoPath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });

        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });

        createReadStream(videoPath).pipe(res);
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
    const existingFile = await this.prisma.movieFile.findUnique({
      where: { id },
    });

    if (!existingFile) {
      throw new NotFoundException(`ID: ${id} bo'lgan fayl topilmadi`);
    }

    return await this.prisma.movieFile.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const file = await this.prisma.movieFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`O'chirish uchun fayl topilmadi`);
    }

    const filePath = join(
      process.cwd(),
      'src',
      'uploads',
      'videos',
      file.fileUrl,
    );
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await this.prisma.movieFile.delete({
      where: { id },
    });

    return { success: true, message: `Fayl muvaffaqiyatli o'chirildi` };
  }
}
