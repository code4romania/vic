import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MobileOwnershipService } from 'src/usecases/volunteer/mobile-ownership.service';

// Endpoints that act on the volunteer's own data need a profile (a user row): a login that has
// not created one yet answers 404 USER_001, the same signal GET /mobile/user/profile gives.
@Injectable()
export class MobileProfileGuard implements CanActivate {
  constructor(private readonly ownership: MobileOwnershipService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) return false;

    this.ownership.assertHasProfile(request.user);
    return true;
  }
}
