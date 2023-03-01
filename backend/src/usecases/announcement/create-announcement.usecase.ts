import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  IAnnouncementModel,
  ICreateAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import SendAnnouncementEvent from 'src/modules/notifications/events/others/send-announcement.event';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetAllOrganizationStructureByTypeUseCase } from '../organization/organization-structure/get-all-organization-structure-by-type.usecase';

@Injectable()
export class CreateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly eventEmitter: EventEmitter2,
    private readonly getAllOrganizationStructureByTypeUseCase: GetAllOrganizationStructureByTypeUseCase,
    private readonly exceptionsService: ExceptionsService,
    private readonly volunteerFacade: VolunteerFacade,
  ) {}

  public async execute(
    createData: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    // 1. Check if only departments were chosen and calculate the total number of volunteers
    let targetedVolunteers = 0;
    if (createData.targetsIds.length !== 0) {
      const departments =
        await this.getAllOrganizationStructureByTypeUseCase.execute(
          OrganizationStructureType.DEPARTMENT,
          createData.organizationId,
        );

      const filteredtargets = departments.filter((department) => {
        if (createData.targetsIds.includes(department.id)) {
          targetedVolunteers += department.members;
          return true;
        }
      });

      if (filteredtargets.length !== createData.targetsIds.length) {
        this.exceptionsService.badRequestException(
          AnnouncementExceptionMessages.ANNOUNCEMENT_003,
        );
      }
    }

    if (createData.targetsIds.length === 0) {
      targetedVolunteers = await this.volunteerFacade.count({
        where: {
          organizationId: createData.organizationId,
          status: VolunteerStatus.ACTIVE,
        },
      });
    }

    // 2. Create announcement
    const announcement = await this.announcementFacade.create({
      targetedVolunteers,
      publishedOn:
        createData.status === AnnouncementStatus.PUBLISHED ? new Date() : null,
      ...createData,
    });

    // 3. Send email to targets if announcement is published
    if (announcement.status === AnnouncementStatus.PUBLISHED) {
      this.eventEmitter.emit(
        EVENTS.OTHER.SEND_ANNOUNCEMENT,
        new SendAnnouncementEvent(
          announcement.organizationId,
          announcement.id,
          announcement.targets?.map((target) => target.id),
        ),
      );
    }

    return announcement;
  }
}
