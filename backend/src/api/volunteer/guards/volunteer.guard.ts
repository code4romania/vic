import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetOneVolunteerUsecase } from 'src/usecases/volunteer/get-one-volunteer.usecase';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';

@Injectable()
export class VolunteerGuard implements CanActivate {
  constructor(private getOneVolunteerUsecase: GetOneVolunteerUsecase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const volunteerId: string = request?.params?.id;
    const user: AdminUserEntity = request.user;

    if (!user) return false;
    if (!volunteerId) return true;

    const volunteer: IVolunteerModel =
      await this.getOneVolunteerUsecase.execute(volunteerId);

    if (volunteer.organization.id !== user.organizationId) return false;

    return true;
  }
}
