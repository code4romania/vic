import { isUUID } from 'class-validator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { MobileOwnershipService } from 'src/usecases/volunteer/mobile-ownership.service';

// /mobile/activity-log/:id: only the volunteer's own hours; others answer 404 ACTIVITY_LOG_001.
@Injectable()
export class ActivityLogMobileGuard implements CanActivate {
  constructor(private readonly ownership: MobileOwnershipService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: IRegularUserModel = request.user;
    if (!user) return false;

    this.ownership.assertHasProfile(user);

    const activityLogId: string = request.params?.id;
    // A malformed id is left to the UuidValidationPipe (400)
    if (!activityLogId || !isUUID(activityLogId)) return true;

    await this.ownership.activityLog(user.id, activityLogId);
    return true;
  }
}
