import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { APP_VERSION } from 'src/common/constants/version';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';

@Controller('public')
export class PublicController {
  constructor(private readonly authConfig: AuthConfigService) {}

  @SkipThrottle()
  @Get('health')
  healthCheck(): 'OK' {
    return 'OK';
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
