import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IEventCandidateModel } from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { GetOneEventUseCase } from '../get-one-event.usecase';

// VIC 2.0 (#496): the volunteers the NGO can add to an event: active, with a profile, from the event's
// departments (every department when the event targets all of them or is public), with their approved
// hours in the organization.
export interface IEventCandidatesResult {
  items: IEventCandidateModel[];
  // null: the event has no capacity
  placesLeft: number | null;
}

@Injectable()
export class GetEventCandidatesUseCase
  implements IUseCaseService<IEventCandidatesResult>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
  ) {}

  async execute(options: {
    eventId: string;
    organizationId: string;
    search?: string;
  }): Promise<IEventCandidatesResult> {
    const event = await this.getOneEventUseCase.execute({
      id: options.eventId,
      organizationId: options.organizationId,
    });

    const [items, going] = await Promise.all([
      this.eventFacade.findCandidates({
        eventId: event.id,
        organizationId: options.organizationId,
        departmentIds: event.targets?.map((target) => target.id),
        search: options.search,
      }),
      this.eventFacade.countGoing(event.id),
    ]);

    return {
      items,
      placesLeft: event.capacity ? Math.max(event.capacity - going, 0) : null,
    };
  }
}
