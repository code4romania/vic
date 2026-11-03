import {
  BullModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService) {}

  createSharedConfiguration(): BullModuleOptions {
    return {
      // Optional; Bull's default `bull` when unset. The e2e tests use their own (.env.test), so a test
      // app's queue workers never take jobs from a dev server sharing the same Redis.
      prefix: this.configService.get('BULL_PREFIX') || 'bull',
      redis: {
        host: this.configService.get('REDIS_HOST'),
        port: +this.configService.get('REDIS_PORT'),
      },
    };
  }
}
