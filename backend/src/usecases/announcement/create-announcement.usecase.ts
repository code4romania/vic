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
  ) {}

  public async execute(
    createData: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    // 1. Create announcement
    const totalNumberOfVolunteers = 0;
    const departments =
      await this.getAllOrganizationStructureByTypeUseCase.execute(
        OrganizationStructureType.DEPARTMENT,
        createData.organizationId,
      );

    const filteredtargets = departments.filter((department) => {
      createData.targetsIds.includes(department.id);
    });

    if (filteredtargets.length !== createData.targetsIds.length) {
      this.exceptionsService.badRequestException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_001,
      );
    }

    const announcement = await this.announcementFacade.create({
      volunteerTargets: totalNumberOfVolunteers,
      publishedOn:
        createData.status === AnnouncementStatus.PUBLISHED ? new Date() : null,
      ...createData,
    });

    // 2. Send email to targets if announcement is published
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
