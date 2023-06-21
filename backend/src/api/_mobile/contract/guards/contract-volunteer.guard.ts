import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RegularUserEntity } from 'src/modules/user/entities/user.entity';
import { GetOneVolunteerUsecase } from 'src/usecases/volunteer/get-one-volunteer.usecase';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';

@Injectable()
export class ContractVolunteerGuard implements CanActivate {
  constructor(private getOneVolunteerUsecase: GetOneVolunteerUsecase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const volunteerId: string = request?.params?.id;
    const user: RegularUserEntity = request.user;

    if (!user) return false;
    if (!volunteerId) return true;

    const volunteer: IVolunteerModel =
      await this.getOneVolunteerUsecase.execute(volunteerId);

    // TODO: review this as we need to validate if the user volunteer and organization are a match
    if (volunteer.organization.id !== user.activeOrganizationId) return false;

    return true;
  }
}
