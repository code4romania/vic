import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneEventUseCase } from './get-one-event.usecase';
import { GetActivityLogCountUsecase } from '../activity-log/get-activity-log-count.usecase';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { JSONStringifyError } from 'src/common/helpers/utils';

@Injectable()
export class DeleteEventUseCase implements IUseCaseService<string> {
  private readonly logger = new Logger(DeleteEventUseCase.name);
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly getActivityLogCountUseCase: GetActivityLogCountUsecase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(id: string, admin: IAdminUserModel): Promise<string> {
    // 1. check if event exists
    const toBeDeleted = await this.getOneEventUseCase.execute({ id });

    // 2.1 get activity logs count
    const activityLogCount = await this.getActivityLogCountUseCase.execute({
      eventId: id,
      organizationId: admin.organizationId,
    });

    // 2.2 check if the event has logged hours
    if (activityLogCount > 0) {
      this.exceptionService.badRequestException(
        EventExceptionMessages.EVENT_007,
      );
    }

    try {
      // 3. delete the file from s3
      if (toBeDeleted.posterPath) {
        await this.s3Service.deleteFile(toBeDeleted.posterPath);
      }
    } catch (error) {
      // log error
      this.logger.error({
        ...EventExceptionMessages.EVENT_008,
        error: JSONStringifyError(error),
      });
      // error while uploading file to s3
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_008,
      );
    }

    // 4. delete event
    const deleted = await this.eventFacade.delete(id);

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.DELETE_EVENT,
      {
        eventId: toBeDeleted.id,
        eventName: toBeDeleted.name,
      },
      admin,
    );

    return deleted;
  }
}
