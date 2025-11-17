import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3002',
        'https://localhost:3000',
        'https://wanna-colive-frontend.vercel.app',
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT ?? 3001);
    console.log(`Application is running on: ${process.env.PORT ?? 3001}`);
  } catch (error) {
    console.error(
      `Error al iniciar la aplicación: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  console.error(
    `Error fatal en bootstrap: ${error instanceof Error ? error.message : 'Unknown error'}`,
  );
  process.exit(1);
});
