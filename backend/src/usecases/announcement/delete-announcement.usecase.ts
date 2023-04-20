import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class DeleteAnnouncementUseCase implements IUseCaseService<string> {
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(id: string, admin: IAdminUserModel): Promise<string> {
    // 1. Find the announcement
    const announcement = await this.announcementFacade.find({ id });

    // 2. Check if announcement exists, if not throw exception
    if (!announcement) {
      this.exceptionsService.notFoundException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_001,
      );
    }

    // 2. Delete the announcement
    const deleted = await this.announcementFacade.delete(announcement.id);

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.DELETE_ANNOUNCEMENT,
      {
        announcementId: announcement.id,
        announcementTitle: announcement.name,
      },
      admin,
    );

    return deleted;
  }
}
