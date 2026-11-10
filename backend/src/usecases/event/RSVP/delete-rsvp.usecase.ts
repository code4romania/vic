import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { GetOneEventRSVPUseCase } from './get-one-rsvp.usecase';

@Injectable()
export class DeleteEventRSVPUseCase implements IUseCaseService<string> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventRSVPUseCase: GetOneEventRSVPUseCase,
  ) {}

  public async execute(eventId: string, userId: string): Promise<string> {
    const toDelete = await this.getOneEventRSVPUseCase.execute({
      eventId,
      userId,
    });

    // M13: a registration the NGO rejected is not forgotten when the volunteer cancels it, so a new
    // "going" goes back to the NGO instead of being approved automatically.
    if (
      toDelete.status === EventRegistrationStatus.REJECTED ||
      toDelete.rejectionReason
    ) {
      await this.eventFacade.withEventLock(eventId, (tx) =>
        tx.update(toDelete.id, {
          going: false,
          status: EventRegistrationStatus.REJECTED,
        }),
      );
      return toDelete.id;
    }

    return this.eventFacade.deleteRSVP(toDelete.id);
  }
}
