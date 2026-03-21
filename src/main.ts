import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EncryptionInterceptor } from './common/interceptors/encryption.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new EncryptionInterceptor());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  const config = new DocumentBuilder()
    .setTitle('Kino time swagger API')
    .setDescription(`Kino time sayti uchun backend tizimi API hujjatlari`)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Tokenni kiriting',
      in: 'header',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger/api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  // Keep-alive script for Render free tier
  const KEEP_ALIVE_URL = 'https://kino-time.onrender.com';
  setInterval(() => {
    import('https').then(({ get }) => {
      get(KEEP_ALIVE_URL, (res) => {
        console.log(`Keep-alive ping sent to ${KEEP_ALIVE_URL}. Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('Keep-alive ping failed:', err.message);
      });
    });
  }, 1000 * 60 * 5); // 5 minutes
}
bootstrap();
