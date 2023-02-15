import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('public')
export class PublicController {
  @SkipThrottle()
  @Get('health')
  healthCheck(): 'OK' {
    return 'OK';
  }

  @SkipThrottle()
  @Get('version')
  version(): unknown {
    return { version: process.env.npm_package_version };
  }
}
