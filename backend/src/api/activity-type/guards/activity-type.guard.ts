import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetOneActivityTypeUseCase } from 'src/usecases/activity-type/get-one-activity-type.usecase';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';

@Injectable()
export class ActivityTypeGuard implements CanActivate {
  constructor(private getOneActivityTypeUseCase: GetOneActivityTypeUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const activityTypeId: string = request?.params?.id;
    const user: AdminUserEntity = request?.user;

    if (!user) return false;
    if (!activityTypeId) return true; // Skip endpoints without IDs

    const activityType: IActivityTypeModel =
      await this.getOneActivityTypeUseCase.execute(activityTypeId);

    if (activityType?.organization?.id !== user.organizationId) return false;

    return true;
  }
}
