import {
  Global,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Injectable()
class RedisShutdown implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // Tolerates a connection that is already closing or closed ("Connection is closed" otherwise).
  async onApplicationShutdown(): Promise<void> {
    if (this.redis.status === 'end') return;
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }
}

/**
 * A plain ioredis client for counters (auth rate limits). Every key gets REDIS_KEY_PREFIX,
 * empty unless set; the specs use `test:`.
 *
 * @isGlobal imported once in AppModule; inject it with @Inject(REDIS_CLIENT)
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis =>
        new Redis({
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
          keyPrefix: configService.get('REDIS_KEY_PREFIX') || '',
        }),
    },
    RedisShutdown,
  ],
  exports: [REDIS_CLIENT],
})
export class RedisProviderModule {}
