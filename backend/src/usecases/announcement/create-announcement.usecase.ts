import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import {
  IAnnouncementModel,
  ICreateAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import SendAnnouncementEvent from 'src/modules/notifications/events/others/send-announcement.event';

@Injectable()
export class CreateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    createData: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    // 1. Create announcement
    const announcement = await this.announcementFacade.create({
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
