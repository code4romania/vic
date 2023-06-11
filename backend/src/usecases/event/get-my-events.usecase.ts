import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { EventFilterEnum } from 'src/modules/event/enums/event-filter.enum';
import {
  FindMyEventsOptions,
  IEventsMobileListItemModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetMyEventsUsecase
  implements IUseCaseService<Pagination<IEventsMobileListItemModel>>
{
  constructor(private readonly eventFacade: EventFacade) {}

  async execute(
    findOptions: FindMyEventsOptions,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { eventFilter, ...filters } = findOptions;
    switch (eventFilter) {
      case EventFilterEnum.OPEN: {
        // 1. get all ongoing events public + from all my organization
        return this.eventFacade.findOpenEvents(filters);
      }
      case EventFilterEnum.GOING: {
        // 2. get all events where i have said join true and have not started or are in progress
        return this.eventFacade.findGoingEvents(filters);
      }
      case EventFilterEnum.ORGANIZATIONS: {
        // 3. get all events from all organizations i am part of that have not started or are in progress
        return this.eventFacade.findMyOrganizationsEvents(filters);
      }
    }
  }
}
