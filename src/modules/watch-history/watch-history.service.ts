// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import { PrismaService } from 'src/core/db/prisma/prisma.service';
// import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';

// @Injectable()
// export class WatchHistoryService {
//   constructor(private readonly prisma: PrismaService) { }

//   async create(payload: CreateWatchHistoryDto, userId: number) {
//     const exist = await this.prisma.watchHistory.findFirst({
//       where: {
//         userId,
//         movieId: payload.movieId,
//       },
//     });

//     if (exist) {
//       throw new ConflictException('Bu kino allaqachon watch history da mavjud');
//     }

//     const data = await this.prisma.watchHistory.create({
//       data: {
//         userId, 
//         movieId: payload.movieId,
//         },
//     });

//     return {
//       success: true,
//       message: 'Watch history created',
//       data,
//     };
//   }

//   async findAll() {
//     const data = await this.prisma.watchHistory.findMany({
//       orderBy: { id: 'desc' },
//       include: {
//         user: true,
//         movie: true,
//       },
//     });

//     return {
//       success: true,
//       data,
//     };
//   }

//   async findOne(id: number) {
//     const data = await this.prisma.watchHistory.findFirst({
//       where: { id },
//       include: {
//         user: true,
//         movie: true
//       }
//     });

//     if (!data) {
//       throw new NotFoundException('Watch history not found');
//     }

//     return {
//       success: true,
//       data,
//     };
//   }



//   async remove(id: number) {
//     const exist = await this.prisma.watchHistory.findUnique({
//       where: { id },
//     });

//     if (!exist) {
//       throw new NotFoundException('Watch history not found');
//     }

//     await this.prisma.watchHistory.delete({
//       where: { id },
//     });

//     return {
//       success: true,
//       message: 'Watch history deleted',
//     };
//   }
// }