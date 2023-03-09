import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
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

    return this.eventFacade.deleteRSVP(toDelete.id);
  }
}
