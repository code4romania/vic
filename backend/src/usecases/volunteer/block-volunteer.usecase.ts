import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';

@Injectable()
export class BlockVolunteerUsecase implements IUseCaseService<IVolunteerModel> {
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
  ) {}

  public async execute(
    volunteerId: string,
    adminUser: IAdminUserModel,
  ): Promise<IVolunteerModel> {
    await this.getOneVolunteerUsecase.execute(volunteerId);

    return this.volunteerFacade.block({
      id: volunteerId,
      blockedById: adminUser.id,
    });
  }
}
