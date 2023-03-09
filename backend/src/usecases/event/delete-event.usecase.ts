import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class DeleteEventUseCase implements IUseCaseService<string> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<string> {
    const deleted = await this.eventFacade.delete(id);

    // TODO: check if there are hours logged on this event and prevent deletion

    if (!deleted) {
      this.exceptionService.badRequestException(
        EventExceptionMessages.EVENT_001,
      );
    }

    return deleted;
  }
}
