import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyEventRSVPOptions,
  IEventRSVPModel,
} from 'src/modules/event/models/event-rsvp.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetManyEventRSVPUseCase
  implements IUseCaseService<Pagination<IEventRSVPModel>>
{
  constructor(private readonly eventFacade: EventFacade) {}

  public async execute(
    findOptions: FindManyEventRSVPOptions,
  ): Promise<Pagination<IEventRSVPModel>> {
    return this.eventFacade.findManyRSVP(findOptions);
  }
}
