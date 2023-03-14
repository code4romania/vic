import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { APP_VERSION } from 'src/common/constants/version';

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
    return APP_VERSION;
  }
}
