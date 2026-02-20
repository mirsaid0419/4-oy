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
import { PrismaModule } from './core/db/prisma.module';
import { StudentsModule } from './modules/students/students.module';
import { StudentGroupsModule } from './modules/groups/student-groups/student-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    StaffsModule,
    TeachersModule,
    StudentsModule,
    StudentGroupsModule,
    RoomsModule,
    CoursesModule,
    GroupsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '1h' },
    }),
    EmailModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
