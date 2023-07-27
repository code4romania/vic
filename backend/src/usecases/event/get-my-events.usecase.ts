import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
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
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    findOptions: FindMyEventsOptions,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { eventFilter, ...filters } = findOptions;
    let events = null;
    switch (eventFilter) {
      case EventFilterEnum.OPEN: {
        // 1. get all ongoing events public + from all my organization
        events = await this.eventFacade.findOpenEvents(filters);
        break;
      }
      case EventFilterEnum.GOING: {
        // 2. get all events where i have said join true and have not started or are in progress
        events = await this.eventFacade.findGoingEvents(filters);
        break;
      }
      case EventFilterEnum.ORGANIZATIONS: {
        // 3. get all events from all organizations i am part of that have not started or are in progress
        events = await this.eventFacade.findMyOrganizationsEvents(filters);
        break;
      }
    }

    const itemsWithPaths = await Promise.all(
      events.items.map(async (item) => ({
        ...item,
        poster: item.poster
          ? await this.s3Service.generatePresignedURL(item.poster)
          : null,
      })),
    );

    return {
      ...events,
      items: itemsWithPaths,
    };
  }
}
