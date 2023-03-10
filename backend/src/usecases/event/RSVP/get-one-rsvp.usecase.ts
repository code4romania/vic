import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventRSVPExceptionMessages } from 'src/modules/event/exceptions/event-rsvp.exceptions';
import {
  FindEventRSVPOptions,
  IEventRSVPModel,
} from 'src/modules/event/models/event-rsvp.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetOneEventRSVPUseCase
  implements IUseCaseService<IEventRSVPModel>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: FindEventRSVPOptions,
  ): Promise<IEventRSVPModel> {
    const rsvp = await this.eventFacade.findRSVP(findOptions);

    if (!rsvp) {
      throw this.exceptionsService.notFoundException(
        EventRSVPExceptionMessages.EVENT_RSVP_001,
      );
    }

    return rsvp;
  }
}
