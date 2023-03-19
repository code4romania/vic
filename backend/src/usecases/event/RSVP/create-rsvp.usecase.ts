import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventAttendOptions } from 'src/modules/event/enums/event-attendance-options.enum';
import { EventRSVPExceptionMessages } from 'src/modules/event/exceptions/event-rsvp.exceptions';
import {
  CreateEventRSVPOptions,
  IEventRSVPModel,
} from 'src/modules/event/models/event-rsvp.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneRegularUserUseCase } from 'src/usecases/user/get-one-regular-user.usecase';
import { GetOneEventUseCase } from '../get-one-event.usecase';

@Injectable()
export class CreateEventRSVPUseCase
  implements IUseCaseService<IEventRSVPModel>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly getOneRegularUserUseCase: GetOneRegularUserUseCase,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(data: CreateEventRSVPOptions): Promise<IEventRSVPModel> {
    // 1. Check if the event and the user exists
    const event = await this.getOneEventUseCase.execute({ id: data.eventId });
    await this.getOneRegularUserUseCase.execute(data.userId);

    const volunteer = await this.volunteerFacade.find({
      userId: data.userId,
      organizationId: event.organization.id,
    });

    if (volunteer) {
      // 2. Only ACTIVE volunteers can join events. In case the user is already a volunteer and is BLOCKED or ARCHIVED. Non-volunteers will pass this validation for public events
      if (volunteer.status !== VolunteerStatus.ACTIVE) {
        this.exceptionsService.badRequestException(
          EventRSVPExceptionMessages.EVENT_RSVP_003,
        );
      } else if (!volunteer.volunteerProfile) {
        // 3. Volunteers must have the profile completed to RSVP.
        this.exceptionsService.badRequestException(
          EventRSVPExceptionMessages.EVENT_RSVP_005,
        );
      }
    }

    // 4. For "private" events, check if the USER is VOLUNTEER in the ORGANIZATION of the EVENT
    if (!event.isPublic && !volunteer) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_002,
      );
    }

    // 5. Check if userId and eventId is unique in RSVP, if exists, update only the "going" response
    const existingRSVP = await this.eventFacade.findRSVP({
      userId: data.userId,
      eventId: data.eventId,
    });

    if (existingRSVP) {
      return existingRSVP.going === data.going
        ? existingRSVP
        : this.eventFacade.updateRSVP(existingRSVP.id, { going: data.going });
    }

    // 6. Check if event requires mention and that mention is present
    if (event.attendanceType === EventAttendOptions.MENTION && !data.mention) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_004,
      );
    } else if (event.attendanceType === EventAttendOptions.SIMPLE) {
      // 6.1. Simple events does not need mentions
      data.mention = null;
    }

    return this.eventFacade.createRSVP(data);
  }
}
