import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Environment } from './infrastructure/config/environment-config';
import { createQueueMonitoring } from './infrastructure/config/create-bull-board';
import { json } from 'express';
import { ExceptionsFilter } from './infrastructure/filters/exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' })); // Increase the limit to 50mb to avoid the error "Request Entity Too Large"

  app.enableCors({
    exposedHeaders: 'content-disposition', // Allow header in the Axios Response Headers
  });

  app.use(helmet());

  app.useGlobalFilters(new ExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: false,
    }),
  );

  app.use('/admin/queues', createQueueMonitoring(app).getRouter());

  // Create swagger module only local or development
  if (!(process.env.NODE_ENV === Environment.Production)) {
    const options = new DocumentBuilder()
      .setTitle('VIC API Documentation')
      .setDescription('VIC API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const PORT = +process.env.PORT || 3001;

  await app.listen(PORT).then(() => {
    console.log(`App running on: http://localhost:${PORT}`);
    console.log(
      `Swagger documentation available at: http://localhost:${PORT}/api`,
    );
  });
}
bootstrap();
