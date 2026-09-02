import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const webOrigin = process.env.APP_WEB_ORIGIN ?? 'http://localhost:3000';
  const adminOrigin = process.env.APP_ADMIN_ORIGIN ?? 'http://localhost:3002';
  app.enableCors({ origin: [webOrigin, adminOrigin], credentials: true });

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
