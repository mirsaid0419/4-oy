import { Module } from '@nestjs/common';
import { PrismaModule } from './core/db/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module';
import { UserSubscriptionModule } from './modules/user-subscription/user-subscription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CategoryModule } from './modules/category/category.module';
import { MovieModule } from './modules/movie/movie.module';
import { MovieCategoryModule } from './modules/movie-category/movie-category.module';
import { MovieFileModule } from './modules/movie-file/movie-file.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { ReviewModule } from './modules/review/review.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '2h' },
    }),
    PrismaModule,
    UsersModule,
    ProfileModule,
    SubscriptionPlanModule,
    UserSubscriptionModule,
    PaymentModule,
    CategoryModule,
    MovieModule,
    MovieCategoryModule,
    MovieFileModule,
    FavoriteModule,
    ReviewModule,
    WatchHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
