import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as semver from 'semver';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';

export const APP_VERSION_HEADER = 'x-app-version';

// Global guard: only /mobile routes, only when the app sends x-app-version. Old builds send no header and
// keep failing on their Cognito token instead (decisions R22); AUTH_011 serves future version bumps.
@Injectable()
export class MobileVersionGuard implements CanActivate {
  constructor(private readonly authConfig: AuthConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (!request.path.startsWith('/mobile')) return true;

    const version = semver.coerce(request.header(APP_VERSION_HEADER));
    const minimum = semver.coerce(this.authConfig.mobileMinVersion);
    if (version && minimum && semver.lt(version, minimum)) {
      throw new AuthException(AuthExceptionCodes.AUTH_011);
    }

    return true;
  }
}
