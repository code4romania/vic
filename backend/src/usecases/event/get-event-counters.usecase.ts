import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  EventCountersOptions,
  IEventCountersModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

// VIC 2.0 (#493): upcoming events, ongoing events and their participants, for the events page
@Injectable()
export class GetEventCountersUseCase
  implements IUseCaseService<IEventCountersModel>
{
  constructor(private readonly eventFacade: EventFacade) {}

  execute(options: EventCountersOptions): Promise<IEventCountersModel> {
    return this.eventFacade.countByState(options);
  }
}
