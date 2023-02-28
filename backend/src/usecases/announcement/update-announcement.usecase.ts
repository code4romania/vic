import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  IAnnouncementModel,
  IUpdateAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import SendAnnouncementEvent from 'src/modules/notifications/events/others/send-announcement.event';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { GetAllOrganizationStructureByTypeUseCase } from '../organization/organization-structure/get-all-organization-structure-by-type.usecase';

@Injectable()
export class UpdateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly getAllOrganizationStructureByTypeUseCase: GetAllOrganizationStructureByTypeUseCase,
  ) {}

  public async execute(
    updateData: IUpdateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    // 1. Check if the announcement exists
    const announcementToUpdate = await this.announcementFacade.find({
      id: updateData.id,
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
    const departments =
      await this.getAllOrganizationStructureByTypeUseCase.execute(
        OrganizationStructureType.DEPARTMENT,
        updateData.organizationId,
      );

    if (updateData.targetsIds) {
      const filteredtargets = departments.filter((department) => {
        if (updateData.targetsIds.includes(department.id)) {
          targetedVolunteers += department.members;
          return true;
        }
      });

      if (filteredtargets.length !== updateData.targetsIds.length) {
        this.exceptionsService.badRequestException(
          AnnouncementExceptionMessages.ANNOUNCEMENT_003,
        );
      }
    }

    // 4. Update the announcement
    const updatedAnnouncement = await this.announcementFacade.update({
      publishedOn:
        updateData.status === AnnouncementStatus.PUBLISHED ? new Date() : null,
      targetedVolunteers,
      ...updateData,
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
