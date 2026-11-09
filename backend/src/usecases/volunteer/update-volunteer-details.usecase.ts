import { ObjectDiff } from 'src/common/helpers/object-diff';
import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import {
  IVolunteerModel,
  UpdateVolunteerDetailsOptions,
} from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';

// Source and favorite flag are NGO bookkeeping: editable in every status.
@Injectable()
export class UpdateVolunteerDetailsUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    volunteerId: string,
    details: UpdateVolunteerDetailsOptions,
    admin: IAdminUserModel,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);

    const updates: UpdateVolunteerDetailsOptions = {};
    if (details.source !== undefined) {
      updates.source = details.source?.trim() || null;
    }
    if (details.isFavorite !== undefined) {
      updates.isFavorite = details.isFavorite;
    }
    if (Object.keys(updates).length === 0) return volunteer;

    const updated = await this.volunteerFacade.updateDetails(
      volunteerId,
      updates,
    );

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.UPDATE_VOLUNTEER_PROFILE,
      {
        volunteerId: volunteer.id,
        volunteerName: volunteer.user?.name,
      },
      admin,
      ObjectDiff.diff(
        { source: volunteer.source, isFavorite: volunteer.isFavorite },
        { source: updated.source, isFavorite: updated.isFavorite },
      ),
    );

    return updated;
  }
}
