import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventVolunteerStatus } from 'src/modules/event/enums/event-volunteer-status.enum';
import {
  FindOneEventOptions,
  IEventWithVolunteerStatus,
} from 'src/modules/event/models/event.model';
import { GetOneEventUseCase } from './get-one-event.usecase';

@Injectable()
export class GetOneEventWithVolunteerStatusUsecase
  implements IUseCaseService<IEventWithVolunteerStatus>
{
  constructor(
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: FindOneEventOptions,
  ): Promise<IEventWithVolunteerStatus> {
    const { userId, ...options } = findOptions;
    // 1. get event
    const event = await this.getOneEventUseCase.execute(options);

    // 2. count the number of rsvps going for this event
    const { eventRsvps, ...rest } = event;

    const numberOfPersonsGoingToEvent = eventRsvps.map(
      (rsvp) => rsvp.going,
    ).length;

    // 3.1 check if the user has responded to this event
    const rsvp = eventRsvps.find((rsvp) => rsvp.user.id === userId);
    // 3.2 map event status in regards to this volunteer
    const volunteerStatus = rsvp
      ? rsvp.going
        ? EventVolunteerStatus.JOINED
        : EventVolunteerStatus.DECLINED
      : EventVolunteerStatus.NO_RESPONSE;

    return {
      ...rest,
      volunteerStatus,
      numberOfPersonsGoingToEvent,
    };
  }
}
