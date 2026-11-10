import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { GetOneActivityLogUsecase } from './get-one-activity-log.usecase';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityLogExceptionMessages } from 'src/modules/activity-log/exceptions/activity-log.exceptions';
import { assertVolunteerEditable } from 'src/modules/volunteer/volunteer-status.rules';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

@Injectable()
export class CancelActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly exceptionService: ExceptionsService,
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(id: string, user: IRegularUserModel): Promise<void> {
    // 1. Check if the log to be delete, exists
    const log = await this.getOneActivityLogUsecase.execute(id);
    // An inactive or blocked volunteer's hours are read-only
    assertVolunteerEditable(log.volunteer);

    if (log.status !== ActivityLogStatus.PENDING) {
      this.exceptionService.badRequestException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_004,
      );
    }

    await this.activityLogFacade.delete(id);

    // #593: the volunteer deleted their pending hours; the NGO sees it in the actions history
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CANCEL_ACTIVITY_LOG,
      {
        activityLogId: log.id,
        volunteerId: log.volunteer?.id,
        volunteerName: log.volunteer?.user?.name,
        organizationId: log.organization?.id,
      },
      user,
    );
  }
}
