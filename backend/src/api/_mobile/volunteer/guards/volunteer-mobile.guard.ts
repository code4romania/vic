import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GetOneVolunteerUsecase } from 'src/usecases/volunteer/get-one-volunteer.usecase';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

@Injectable()
export class VolunteerMobileGuard implements CanActivate {
  constructor(private getOneVolunteerUsecase: GetOneVolunteerUsecase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const volunteerId: string = request?.params?.id;
    const user: IRegularUserModel = request.user;

    if (!user) return false;
    if (!volunteerId) return true;

    const volunteer: IVolunteerModel =
      await this.getOneVolunteerUsecase.execute(volunteerId);

    if (volunteer.user.id !== user.id) return false;

    return true;
  }
}
