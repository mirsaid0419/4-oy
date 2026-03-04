import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import graphqlUploadExpress from 'graphql-upload/public/graphqlUploadExpress.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Fayl hajmi chegarasini belgilash (masalan 10MB)
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

  // Static fayllarni xizmat qilish (masalan public ichidagi rasmlar)
  app.useStaticAssets(join(process.cwd(), 'public'));

  // CORS-ni yoqish
  app.enableCors({
    origin: true, // barcha originlarga ruxsat (yoki aniq ['http://localhost:3000'] deb yozish mumkin)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000);
  console.log('Server running on http://localhost:3000/graphql');
}
bootstrap();
