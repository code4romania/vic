import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import { IEventModel } from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneEventUseCase } from './get-one-event.usecase';

@Injectable()
export class ArchiveEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    id: string,
    admin: IAdminUserModel,
  ): Promise<IEventModel> {
    // 1. Find the event to publish
    const event = await this.getOneEventUseCase.execute({ id });

    // 2. Can't publish an already published event
    if (event.status === EventStatus.ARCHIVED) {
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_006,
      );
    }

    const updated = await this.eventFacade.archive(id);

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_EVENT_STATUS,
      {
        eventId: updated.id,
        eventName: updated.name,
        oldStatus: event.status,
        newStatus: updated.status,
      },
      admin,
      admin.organizationId,
    );

    return updated;
  }
}
