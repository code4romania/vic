import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IError } from 'src/common/exceptions/exceptions.interface';
import { JSONStringifyError } from 'src/common/helpers/stringify-error';
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

@Injectable()
export class UpdateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  private readonly logger = new Logger(UpdateAnnouncementUseCase.name);

  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly eventEmitter: EventEmitter2,
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
        AnnouncementExceptionMessages.ANNOUNCEMENT_005,
      );
    }

    try {
      // 3. Update the announcement
      const updatedAnnouncement = await this.announcementFacade.update(
        updateData,
      );

      // 4. Send email to targets if announcement is published
      if (updatedAnnouncement.status === AnnouncementStatus.PUBLISHED) {
        this.eventEmitter.emit(
          EVENTS.OTHER.SEND_ANNOUNCEMENT,
          new SendAnnouncementEvent(
            updatedAnnouncement.organizationId,
            updatedAnnouncement.id,
            updatedAnnouncement.targets.map((target) => target.id),
          ),
        );
      }

      return updatedAnnouncement;
    } catch (error) {
      // create new error object to log
      const loggedError: IError<IUpdateAnnouncementModel> = {
        error: JSONStringifyError(error),
        businessError: AnnouncementExceptionMessages.ANNOUNCEMENT_003,
        data: updateData,
      };

      // log the created error
      this.logger.error(loggedError);

      // throw excepition for failing to update the announcement
      this.exceptionsService.internalServerErrorException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_003,
      );
    }
  }
}
