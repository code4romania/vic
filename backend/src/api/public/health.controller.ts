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
  version(): string {
    return process.env.npm_package_version;
  }
}
