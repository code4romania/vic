import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import {
  FindOneEventOptions,
  IEventModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetOneEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(findOptions: FindOneEventOptions): Promise<IEventModel> {
    const event = await this.eventFacade.find(findOptions);

    if (!event) {
      this.exceptionService.badRequestException(
        EventExceptionMessages.EVENT_001,
      );
    }

    return event;
  }
}
