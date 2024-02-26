import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('PORT');

  app.setGlobalPrefix('api');
  app.enableCors();

  const swagger = new DocumentBuilder()
    .setTitle('lms')
    .setDescription('The lms API description')
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port || 5000);
}
bootstrap();
