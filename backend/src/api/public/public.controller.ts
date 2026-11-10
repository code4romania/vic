import {
  Controller,
  Get,
  Inject,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import Redis from 'ioredis';
import { APP_VERSION } from 'src/common/constants/version';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { REDIS_CLIENT } from 'src/infrastructure/providers/redis/redis-provider.module';
import { DataSource } from 'typeorm';

type Check = 'up' | 'down';
export interface HealthStatus {
  status: 'ok' | 'error';
  database: Check;
  redis: Check;
}

// A dependency that does not answer within this time counts as down.
const HEALTH_TIMEOUT_MS = 2000;

@Controller('public')
export class PublicController {
  private readonly logger = new Logger(PublicController.name);

  constructor(
    private readonly authConfig: AuthConfigService,
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // The load balancer's health check (path /public/health, also open in maintenance mode). 200 only when
  // Postgres and Redis answer; 503 with the same body otherwise, so a task that lost them takes no traffic.
  @SkipThrottle()
  @Get('health')
  async healthCheck(): Promise<HealthStatus> {
    const [database, redis] = await Promise.all([
      this.check('database', () => this.dataSource.query('SELECT 1')),
      this.check('redis', () => this.redis.ping()),
    ]);
    const result: HealthStatus = {
      status: database === 'up' && redis === 'up' ? 'ok' : 'error',
      database,
      redis,
    };
    if (result.status !== 'ok') throw new ServiceUnavailableException(result);
    return result;
  }

  private async check(
    name: string,
    probe: () => Promise<unknown>,
  ): Promise<Check> {
    let timer: NodeJS.Timeout;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`timed out after ${HEALTH_TIMEOUT_MS} ms`)),
        HEALTH_TIMEOUT_MS,
      );
    });
    try {
      await Promise.race([probe(), timeout]);
      return 'up';
    } catch (error) {
      this.logger.error(`Health check: ${name} is down: ${error?.message}`);
      return 'down';
    } finally {
      clearTimeout(timer);
    }
  }

  @SkipThrottle()
  @Get('version')
  version(): unknown {
    return APP_VERSION;
  }

  // The lowest app version the API accepts; the app shows "Update required" below it.
  @SkipThrottle()
  @Get('mobile-version')
  mobileVersion(): { minVersion: string } {
    return { minVersion: this.authConfig.mobileMinVersion };
  }
}
