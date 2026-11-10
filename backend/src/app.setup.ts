import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AuthConfigService } from './infrastructure/config/auth.config';
import { ExceptionsFilter } from './infrastructure/filters/exception.filter';
import { mountQueueMonitoring } from './infrastructure/config/create-bull-board';

// Request-level setup shared by main.ts and the e2e harness, so tests run the same app as production.
export function setupApp(app: NestExpressApplication): void {
  const authConfig = app.get(AuthConfigService);

  // One proxy hop (the load balancer): req.ip is the address it appended to X-Forwarded-For.
  app.set('trust proxy', 1);

  app.use(cookieParser());

  app.enableCors({
    origin: authConfig.corsOrigins,
    credentials: true, // the web refresh cookie
    exposedHeaders: 'content-disposition', // Allow header in the Axios Response Headers
  });

  app.useGlobalFilters(new ExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: false,
    }),
  );

  // Off by default: /admin/queues is a 404 unless BULL_BOARD_ENABLED=true with basic auth credentials.
  mountQueueMonitoring(app);
}
