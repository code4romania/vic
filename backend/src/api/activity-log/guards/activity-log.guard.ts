import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetOneActivityLogUsecase } from 'src/usecases/activity-log/get-one-activity-log.usecase';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';

@Injectable()
export class ActivityLogGuard implements CanActivate {
  constructor(private getOneActivityLogUsecase: GetOneActivityLogUsecase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const activityLogId: string = request?.params?.id;
    const user: AdminUserEntity = request?.user;

    if (!user) return false;
    if (!activityLogId) return true; // Skip endpoints without IDs

    const activityLog: IActivityLogModel =
      await this.getOneActivityLogUsecase.execute(activityLogId);

    if (activityLog?.organization?.id !== user.organizationId) return false;

    return true;
  }
}
