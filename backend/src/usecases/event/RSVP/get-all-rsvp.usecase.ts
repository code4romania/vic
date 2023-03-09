import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindAllEventRSVPOptions,
  IEventRSVPModel,
} from 'src/modules/event/models/event-rsvp.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetAllRSVPUseCase implements IUseCaseService<IEventRSVPModel[]> {
  constructor(private readonly eventFacade: EventFacade) {}
  async execute(
    findOptions: FindAllEventRSVPOptions,
  ): Promise<IEventRSVPModel[]> {
    return this.eventFacade.findAllRSVP(findOptions);
  }
}
