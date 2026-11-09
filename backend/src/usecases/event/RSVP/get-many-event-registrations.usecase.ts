import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyEventRegistrationsOptions,
  IEventRegistrationListItem,
} from 'src/modules/event/models/event-rsvp.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

// #501: the organization's event registrations, by status (pending first, for the NGO to decide)
@Injectable()
export class GetManyEventRegistrationsUseCase
  implements IUseCaseService<Pagination<IEventRegistrationListItem>>
{
  constructor(private readonly eventFacade: EventFacade) {}

  execute(
    options: FindManyEventRegistrationsOptions,
  ): Promise<Pagination<IEventRegistrationListItem>> {
    return this.eventFacade.findManyRegistrations(options);
  }
}
