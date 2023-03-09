import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  IAnnouncementModel,
  UpdateAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import SendAnnouncementEvent from 'src/modules/notifications/events/others/send-announcement.event';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneAnnouncementUseCase } from './get-one-announcement.usecase';

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
  ) {}

  public async execute(
    id: string,
    updateData: UpdateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    // 1. Check if the announcement exists
    const announcementToUpdate = await this.getOneAnnouncementUseCase.execute({
      id,
    });
    if (!announcementToUpdate) {
      this.exceptionsService.notFoundException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_001,
      );
    }
    // 2. Only drafts can be edited/published
    if (announcementToUpdate.status !== AnnouncementStatus.DRAFT) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_002,
      );
    }

    // 3. Check if only departments were chosen and calculate the new total number of volunteers
    let targetedVolunteers = 0;

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

      departments.forEach(
        (department) => (targetedVolunteers += department.members),
      );
    } else {
      targetedVolunteers = await this.volunteerFacade.count({
        organizationId: updateData.organizationId,
        status: VolunteerStatus.ACTIVE,
      });
    }

    // 4. Update the announcement
    const updatedAnnouncement = await this.announcementFacade.update(id, {
      ...updateData,
      publishedOn:
        updateData.status === AnnouncementStatus.PUBLISHED ? new Date() : null,
      targetedVolunteers:
        targetedVolunteers !== 0
          ? targetedVolunteers
          : announcementToUpdate.targetedVolunteers,
    });

    // 5. Send email to targets if announcement is published
    if (updatedAnnouncement.status === AnnouncementStatus.PUBLISHED) {
      this.eventEmitter.emit(
        EVENTS.OTHER.SEND_ANNOUNCEMENT,
        new SendAnnouncementEvent(
          updatedAnnouncement.organizationId,
          updatedAnnouncement.id,
          updatedAnnouncement.targets?.map((target) => target.id),
        ),
      );
    }

    return updatedAnnouncement;
  }
}
