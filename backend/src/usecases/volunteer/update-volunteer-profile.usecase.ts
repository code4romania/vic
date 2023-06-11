import { Injectable } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { UpdateVolunteerProfileOptions } from 'src/modules/volunteer/model/volunteer-profile.model';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

@Injectable()
export class UpdateVolunteerProfileUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    volunteerId: string,
    updates: UpdateVolunteerProfileOptions,
    user: IAdminUserModel | IRegularUserModel,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);

    if (!volunteer.volunteerProfile) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_PROFILE_003,
      );
    }

    await this.volunteerFacade.updateProfile(
      volunteer.volunteerProfile.id,
      updates,
    );

    const updated = await this.getOneVolunteerUsecase.execute(volunteerId);

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.UPDATE_VOLUNTEER_PROFILE,
      {
        volunteerId: volunteer.id,
        volunteerName: volunteer.user?.name,
      },
      user,
      ObjectDiff.diff(volunteer.volunteerProfile, updated.volunteerProfile),
    );

    return updated;
  }
}
