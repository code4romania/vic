import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindOngoingAndFinishedEventOptions,
  IEventModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetEventsByOrganizationUsecase
  implements IUseCaseService<IEventModel[]>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly volunteerFacade: VolunteerFacade,
  ) {}

  async execute(
    findOptions: FindOngoingAndFinishedEventOptions,
  ): Promise<IEventModel[]> {
    const volunteer = await this.volunteerFacade.find({
      userId: findOptions.userId,
      organizationId: findOptions.organizationId,
      status: VolunteerStatus.ACTIVE,
    });

    // if this volunteer does not have access to the organization return []
    if (!volunteer) {
      return [];
    }

    return this.eventFacade.findOngoingAndFinishedEvents(findOptions);
  }
}
