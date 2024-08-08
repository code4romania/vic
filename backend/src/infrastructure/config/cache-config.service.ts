import { Injectable } from '@nestjs/common';
import {
  CacheStore,
  CacheModuleOptions,
  CacheOptionsFactory,
} from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    return {
      isGlobal: true,
      store: (<unknown>redisStore) as CacheStore,
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      ttl: this.configService.get('CACHE_TTL'),
    };
  }
}
