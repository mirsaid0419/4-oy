import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from 'src/core/db/prisma/prisma.service';
import { PrismaModule } from 'src/core/db/prisma/prisma.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
  imports: [PrismaModule],
})
export class ProfileModule {}
