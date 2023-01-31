import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { AUTH_STRATEGIES } from '../auth.constants';

@Injectable()
export class MobileJwtAuthGuard extends AuthGuard(AUTH_STRATEGIES.MOBILE) {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Called to easily handle Public endpoints (using @Public decorator) or continue to pass the logic to handle it with JWT verification
   * @param context
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
