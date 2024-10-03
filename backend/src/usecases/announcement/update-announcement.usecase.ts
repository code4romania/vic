import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import SendAnnouncementEvent from 'src/modules/notifications/events/others/send-announcement.event';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneAnnouncementUseCase } from './get-one-announcement.usecase';
import { GetVolunteersUserDataForNotificationsUsecase } from '../volunteer/get-volunteers-user-data-for-notifications.usecase';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';

@Injectable()
export class UpdateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly getVolunteerUseDataForNotificationsUsecase: GetVolunteersUserDataForNotificationsUsecase,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
  ) {}

  public async execute(
    id: string,
    updateData: UpdateAnnouncementOptions,
    admin: IAdminUserModel,
  ): Promise<IAnnouncementModel> {
    const organization = await this.getOrganizationUsecase.execute(
      admin.organizationId,
    );

    // 1. Check if the announcement exists
    const announcementToUpdate = await this.getOneAnnouncementUseCase.execute({
      id,
    });

    // 2. Only drafts can be edited/published
    if (announcementToUpdate.status !== AnnouncementStatus.DRAFT) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_002,
      );
    }

    // 3. Check if only departments were chosen and calculate the new total number of volunteers
    let targetedVolunteers = 0;

    // check if no target ids are provided and use the ones from db
    // SCENARIO where publish is called from table directly not from the form
    if (updateData.targetsIds === undefined) {
      updateData.targetsIds = announcementToUpdate.targets?.map(
        (target) => target.id,
      );
    }

    // validate if the all the targets are in database as departments for this organizations
    if (updateData.targetsIds?.length) {
      const departments = await this.organizationStructureFacade.findAllByIds({
        ids: updateData.targetsIds,
        type: OrganizationStructureType.DEPARTMENT,
        organizationId: updateData.organizationId,
      });

      if (departments.length !== updateData.targetsIds.length) {
        this.exceptionsService.badRequestException(
          AnnouncementExceptionMessages.ANNOUNCEMENT_003,
        );
      }
    }

    // count the number of active volunteers for this organization
    // [Optional] part of the given departments
    targetedVolunteers = await this.volunteerFacade.count({
      organizationId: updateData.organizationId,
      status: VolunteerStatus.ACTIVE,
      ...(updateData.targetsIds?.length
        ? {
            departmentIds: updateData.targetsIds,
          }
        : {}),
    });

    // 4. Update the announcement
    const updatedAnnouncement = await this.announcementFacade.update(id, {
      ...updateData,
      publishedOn:
        updateData.status === AnnouncementStatus.PUBLISHED ? new Date() : null,
      targetedVolunteers,
    });

    // 5. Send email to targets if announcement is published
    if (updatedAnnouncement.status === AnnouncementStatus.PUBLISHED) {
      const { userEmails, userIds } =
        await this.getVolunteerUseDataForNotificationsUsecase.execute(
          announcementToUpdate.organizationId,
          announcementToUpdate.targets.map((target) => target.id),
        );

      if (userIds.length > 0) {
        this.eventEmitter.emit(
          EVENTS.OTHER.SEND_ANNOUNCEMENT,
          new SendAnnouncementEvent(
            announcementToUpdate.organizationId,
            userIds,
            organization.name,
            userEmails,
            announcementToUpdate.id,
          ),
        );
      }

      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.PUBLISH_ANNOUNCEMENT,
        {
          announcementId: updatedAnnouncement.id,
          announcementTitle: updatedAnnouncement.name,
        },
        admin,
        admin.organizationId,
      );
    }

    return updatedAnnouncement;
  }
}
