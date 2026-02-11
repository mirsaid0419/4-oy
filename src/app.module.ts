import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/db/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { AuthModule } from './modules/auth/auth.module';
import { SecurityModule } from './common/security/security.module.ts.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SecurityModule,
    PrismaModule,
    UsersModule,
    PostsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
