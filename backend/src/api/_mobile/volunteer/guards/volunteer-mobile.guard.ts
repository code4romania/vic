import { isUUID } from 'class-validator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { MobileOwnershipService } from 'src/usecases/volunteer/mobile-ownership.service';

// The volunteer in the route (:volunteerId, or :id on /mobile/volunteer) must belong to the user
// of the token; otherwise 404 VOLUNTEER_001.
@Injectable()
export class VolunteerMobileGuard implements CanActivate {
  constructor(private readonly ownership: MobileOwnershipService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: IRegularUserModel = request.user;
    if (!user) return false;

    this.ownership.assertHasProfile(user);

    const volunteerId: string =
      request.params?.volunteerId ?? request.params?.id;
    // A malformed id is left to the UuidValidationPipe (400)
    if (!volunteerId || !isUUID(volunteerId)) return true;

    await this.ownership.volunteer(user.id, volunteerId);
    return true;
  }
}
