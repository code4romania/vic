import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import { IEventModel } from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { GetOneEventUseCase } from './get-one-event.usecase';

@Injectable()
export class ArchiveEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<IEventModel> {
    // 1. Find the event to publish
    const event = await this.getOneEventUseCase.execute({ id });

    // 2. Can't publish an already published event
    if (event.status === EventStatus.ARCHIVED) {
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_006,
      );
    }

    return this.eventFacade.archive(id);
  }
}
