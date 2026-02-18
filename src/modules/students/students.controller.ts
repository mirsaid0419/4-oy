import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TokenGuard } from 'src/common/guards/token.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
@ApiBearerAuth('token')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin,Role.admin)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        adress: { type: 'string' },
        status: { type: 'string' },
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'src', 'uploads'),
        filename: (req, file, cb) => {
          const name = Date.now() + '_image_' + extname(file.originalname);
          cb(null, name);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new Error('Faqat rasm formatlari (.jpg, .png) ruxsat etilgan!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoPath = file ? file.filename : null;
    const { photo, ...studentinfo } = createStudentDto;
    const result = await this.studentsService.create({
      ...studentinfo,
      photo: photoPath,
    });
    return {
      success: true,
      message: 'Login and password send email',
      staff: result,
    };
  }
  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
