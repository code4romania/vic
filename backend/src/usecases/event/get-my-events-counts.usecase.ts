import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  CountMyEventsOptions,
  IMyEventsCountsModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

// The badges of the mobile Evenimente segments (Deschise, Particip, Organizațiile mele): how many
// events each list holds for the same search and filters.
@Injectable()
export class GetMyEventsCountsUsecase
  implements IUseCaseService<IMyEventsCountsModel>
{
  constructor(private readonly eventFacade: EventFacade) {}

  async execute(
    findOptions: CountMyEventsOptions,
  ): Promise<IMyEventsCountsModel> {
    return this.eventFacade.countMyEvents(findOptions);
  }
}
