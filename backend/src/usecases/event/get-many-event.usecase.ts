import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyEventOptions,
  IEventsListItemModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetManyEventUseCase
  implements IUseCaseService<Pagination<IEventsListItemModel>>
{
  constructor(private readonly eventFacade: EventFacade) {}

  async execute(
    findOptions: FindManyEventOptions,
  ): Promise<Pagination<IEventsListItemModel>> {
    return this.eventFacade.getMany(findOptions);
  }
}
