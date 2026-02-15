import { Global, Module } from '@nestjs/common';
import { PrismaServise } from './prisma.service';
@Global()
@Module({
  providers: [PrismaServise],
  exports: [PrismaServise],
})
export class PrismaModule {}
