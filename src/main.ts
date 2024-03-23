import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { QueryParamsTransformPipe } from './shared/pipes/query-params-transform.pipe';
import { FileValidationPipe } from './shared/pipes/file-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors();
  app.setGlobalPrefix(config.get('API_URL'));

  app.useGlobalPipes(
    new QueryParamsTransformPipe({ transform: true }),
    new FileValidationPipe(),
  );

  const swagger = new DocumentBuilder()
    .setTitle('lms')
    .setDescription('The lms API description')
    .setVersion('0.0.1')
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     in: 'header',
    //   },
    //   'authorization',
    // )
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(config.get('PORT'));
}
bootstrap();
