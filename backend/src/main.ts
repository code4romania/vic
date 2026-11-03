import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupApp } from './app.setup';
import { Environment } from './infrastructure/config/environment-config';
import { createQueueMonitoring } from './infrastructure/config/create-bull-board';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // trust proxy, cookies, CORS limited to CORS_ORIGINS with credentials, the exception filter and the validation pipe.
  setupApp(app);

  app.use(helmet());

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
