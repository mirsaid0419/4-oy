import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(
    {isGlobal:true}
  ), UsersModule, TeachersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
