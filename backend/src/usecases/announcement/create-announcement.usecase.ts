import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  CreateAnnouncementOptions,
  IAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import SendAnnouncementEvent from 'src/modules/notifications/events/others/send-announcement.event';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetVolunteersUserDataForNotificationsUsecase } from '../volunteer/get-volunteers-user-data-for-notifications.usecase';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';

@Injectable()
export class CreateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly eventEmitter: EventEmitter2,
    private readonly exceptionsService: ExceptionsService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly getVolunteerUseDataForNotificationsUsecase: GetVolunteersUserDataForNotificationsUsecase,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
  ) {}

  public async execute(
    announcement: CreateAnnouncementOptions,
    admin: IAdminUserModel,
  ): Promise<IAnnouncementModel> {
    const organization = await this.getOrganizationUsecase.execute(
      announcement.organizationId,
    );

    // 1. Check if only departments were chosen and calculate the total number of volunteers
    let targetedVolunteers = 0;

    // validate if the all the targets are in database as departments for this organizations
    if (announcement.targetsIds?.length) {
      const departments = await this.organizationStructureFacade.findAllByIds({
        ids: announcement.targetsIds,
        type: OrganizationStructureType.DEPARTMENT,
        organizationId: announcement.organizationId,
      });

      if (departments.length !== announcement.targetsIds.length) {
        this.exceptionsService.badRequestException(
          AnnouncementExceptionMessages.ANNOUNCEMENT_003,
        );
      }
    }

    // count the number of active volunteers for this organization
    // [Optional] part of the given departments
    targetedVolunteers = await this.volunteerFacade.count({
      organizationId: announcement.organizationId,
      status: VolunteerStatus.ACTIVE,
      ...(announcement.targetsIds?.length
        ? {
            departmentIds: announcement.targetsIds,
          }
        : {}),
    });

    // 2. Create announcement
    const newAnouncement = await this.announcementFacade.create({
      ...announcement,
      targetedVolunteers,
    });

    // 3. Send email to targets if announcement is published
    if (newAnouncement.status === AnnouncementStatus.PUBLISHED) {
      const { userEmails, userIds } =
        await this.getVolunteerUseDataForNotificationsUsecase.execute(
          newAnouncement.organizationId,
          announcement.targetsIds,
        );

      if (userIds.length > 0) {
        this.eventEmitter.emit(
          EVENTS.OTHER.SEND_ANNOUNCEMENT,
          new SendAnnouncementEvent(
            announcement.organizationId,
            userIds,
            organization.name,
            userEmails,
            newAnouncement.id,
          ),
        );
      }
    }

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_ANNOUNCEMENT,
      {
        announcementId: newAnouncement.id,
        announcementTitle: newAnouncement.name,
        status: newAnouncement.status,
      },
      admin,
    );

    return newAnouncement;
  }
}
