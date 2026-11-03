import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';

export const MAINTENANCE_ERROR = 'MAINTENANCE';

const HEALTH_PATH = '/public/health';

// MAINTENANCE_MODE=true: 503 MAINTENANCE on every route except GET /public/health, unless the client IP is in
// MAINTENANCE_ALLOWED_IPS (the smoke-test team during the cutover and the rehearsal, decisions R2).
//
// The client IP is req.ip with `trust proxy` 1 (set in setupApp): the address the load balancer itself
// appended to X-Forwarded-For. Not the first hop: a client controls everything before the load balancer's
// entry, so an allow-listed IP sent in its own X-Forwarded-For header must not get through.
@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly authConfig: AuthConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (!this.authConfig.maintenanceMode) return next();

    const path = (req.originalUrl ?? req.url).split('?')[0];
    if (req.method === 'GET' && path === HEALTH_PATH) return next();

    if (this.authConfig.maintenanceAllowedIps.includes(normalizeIp(req.ip))) {
      return next();
    }

    res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      code_error: MAINTENANCE_ERROR,
      message: 'VIC is being updated, try again in a few minutes',
    });
  }
}

// Express reports IPv4 clients on a dual-stack socket as ::ffff:1.2.3.4.
function normalizeIp(ip: string): string {
  return ip?.startsWith('::ffff:') ? ip.slice(7) : ip;
}
