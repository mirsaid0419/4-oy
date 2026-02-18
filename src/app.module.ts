import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AuthModule } from './modules/auth/auth.module';
import { StaffsModule } from './modules/staffs/staffs.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './common/email/email.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { CoursesModule } from './modules/courses/courses.module';
import { GroupsModule } from './modules/groups/groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TeachersModule,
    AuthModule,
    StaffsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '1h' },
    }),
    EmailModule,
    RoomsModule,
    CoursesModule,
    GroupsModule,
    // MailerModule.forRoot({
    //   transport: {
    //     host: 'abduqulovmirsai0419@gmail.com',
    //     port: 465,
    //     secure: true,
    //     auth: {
    //       user: 'abduqulovmirsai0419@gmail.com',
    //       pass: 'bogo zdlh ecfg wjtr',
    //     },
    //   },
    //   defaults: {
    //     from: '"No Reply" <abduqulovmirsai0419@gmail.com>',
    //   },
    // }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
