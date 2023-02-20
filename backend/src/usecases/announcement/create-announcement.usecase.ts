import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class CreateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  private readonly logger = new Logger(CreateAnnouncementUseCase.name);

  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    createData: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    try {
      // 1. Create announcement
      const announcement = await this.announcementFacade.create(createData);

      // 2. Send email to targets if announcement is published
      if (announcement.status === AnnouncementStatus.PUBLISHED) {
        this.eventEmitter.emit(
          EVENTS.OTHER.SEND_ANNOUNCEMENT,
          new SendAnnouncementEvent(
            announcement.organizationId,
            announcement.id,
            announcement.targets.map((target) => target.id),
          ),
        );
      }

      return announcement;
    } catch (error) {
      this.exceptionsService.internalServerErrorException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_002,
      );

      this.logger.error({
        error,
        ...AnnouncementExceptionMessages.ANNOUNCEMENT_002,
        createData,
      });
    }
  }
}
