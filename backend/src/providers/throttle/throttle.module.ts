import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { RateLimiterConfigService } from 'src/core/config/rate-limiter-config.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useClass: RateLimiterConfigService,
    }),
  ],
})
export class ThrottleModule {}
