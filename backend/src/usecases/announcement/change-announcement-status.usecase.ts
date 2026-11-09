import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import SendAnnouncementEvent from 'src/modules/notifications/events/others/send-announcement.event';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { GetVolunteersUserDataForNotificationsUsecase } from '../volunteer/get-volunteers-user-data-for-notifications.usecase';
import { GetOneAnnouncementUseCase } from './get-one-announcement.usecase';

// VIC 2.0 (#503): the NGO activates, deactivates and archives announcements by hand.
// Archived is final. The first activation notifies the organization's volunteers.
@Injectable()
export class ChangeAnnouncementStatusUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly exceptionsService: ExceptionsService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly getVolunteerUseDataForNotificationsUsecase: GetVolunteersUserDataForNotificationsUsecase,
    private readonly eventEmitter: EventEmitter2,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    id: string,
    status: AnnouncementStatus,
    admin: IAdminUserModel,
  ): Promise<IAnnouncementModel> {
    const announcement = await this.getOneAnnouncementUseCase.execute({ id });

    if (announcement.status === AnnouncementStatus.ARCHIVED) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_002,
      );
    }
    if (announcement.status === status) return announcement;

    if (status === AnnouncementStatus.ARCHIVED) {
      return this.announcementFacade.update(id, {
        status,
        archivedOn: new Date(),
      });
    }

    if (status === AnnouncementStatus.INACTIVE) {
      return this.announcementFacade.update(id, { status });
    }

    // ACTIVE: notify only the first time it goes live
    const firstActivation = !announcement.publishedOn;
    const targetedVolunteers = await this.volunteerFacade.count({
      organizationId: announcement.organizationId,
      status: VolunteerStatus.ACTIVE,
    });
    const activated = await this.announcementFacade.update(id, {
      status,
      ...(firstActivation ? { publishedOn: new Date() } : {}),
      targetedVolunteers,
    });

    if (firstActivation) {
      const organization = await this.getOrganizationUsecase.execute(
        announcement.organizationId,
      );
      const { userEmails, userIds } =
        await this.getVolunteerUseDataForNotificationsUsecase.execute(
          announcement.organizationId,
        );

      if (userIds.length > 0) {
        this.eventEmitter.emit(
          EVENTS.OTHER.SEND_ANNOUNCEMENT,
          new SendAnnouncementEvent(
            announcement.organizationId,
            userIds,
            organization.name,
            userEmails,
            announcement.id,
          ),
        );
      }

      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.PUBLISH_ANNOUNCEMENT,
        {
          announcementId: activated.id,
          announcementTitle: activated.name,
        },
        admin,
      );
    }

    return activated;
  }
}
