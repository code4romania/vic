import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  IAnnouncementModel,
  UpdateAnnouncementOptions,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { assertDisplayPeriod } from './create-announcement.usecase';
import { GetOneAnnouncementUseCase } from './get-one-announcement.usecase';

// Edits the content and the display period; status changes go through
// ChangeAnnouncementStatusUseCase. Archived announcements are read-only.
@Injectable()
export class UpdateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    id: string,
    updateData: Omit<
      UpdateAnnouncementOptions,
      'status' | 'publishedOn' | 'archivedOn' | 'targetedVolunteers'
    >,
    admin: IAdminUserModel,
  ): Promise<IAnnouncementModel> {
    const announcement = await this.getOneAnnouncementUseCase.execute({ id });

    if (announcement.status === AnnouncementStatus.ARCHIVED) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_002,
      );
    }

    assertDisplayPeriod(
      updateData.displayStartDate ?? announcement.displayStartDate,
      updateData.displayEndDate === undefined
        ? announcement.displayEndDate
        : updateData.displayEndDate,
      this.exceptionsService,
    );

    const updated = await this.announcementFacade.update(id, updateData);

    // #593: edits are in the actions history
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.UPDATE_ANNOUNCEMENT,
      {
        announcementId: updated.id,
        announcementTitle: updated.name,
      },
      admin,
    );

    return updated;
  }
}
