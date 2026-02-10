import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './core/db/prisma.module';
import { TokenMiddleware } from './middleware/chescToken';

@Module({
  imports: [UsersModule, PrismaModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenMiddleware).forRoutes("*")
  }
}
