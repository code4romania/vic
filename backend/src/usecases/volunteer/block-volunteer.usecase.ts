import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';
import { SyncUserOrganizationsUsecase } from '../user/sync-user-organizations.usecase';

@Injectable()
export class BlockVolunteerUsecase implements IUseCaseService<IVolunteerModel> {
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly syncUseOrganizatinosUsecase: SyncUserOrganizationsUsecase,
  ) {}

  public async execute(
    volunteerId: string,
    admin: IAdminUserModel,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);

    const blocked = await this.volunteerFacade.block({
      id: volunteerId,
      blockedById: admin.id,
    });

    await this.syncUseOrganizatinosUsecase.execute(
      volunteer.user.id,
      volunteer.organization.id,
    );

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_VOLUNTEER_STATUS,
      {
        volunteerId: volunteer.id,
        volunteerName: volunteer.user?.name,
        oldStatus: volunteer.status,
        newStatus: blocked.status,
      },
      admin,
    );

    return blocked;
  }
}
