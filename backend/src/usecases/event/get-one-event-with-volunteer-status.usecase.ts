import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { EventVolunteerStatus } from 'src/modules/event/enums/event-volunteer-status.enum';
import {
  FindOneEventOptions,
  IEventWithVolunteerStatus,
} from 'src/modules/event/models/event.model';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import { IEventModel } from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetOneEventWithVolunteerStatusUsecase
  implements IUseCaseService<IEventWithVolunteerStatus>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: FindOneEventOptions,
  ): Promise<IEventWithVolunteerStatus> {
    const { userId, ...options } = findOptions;
    // 1. get event; one the volunteer may not see answers like one that does not exist (M6)
    const event = options.id ? await this.eventFacade.find(options) : null;
    if (!event || !(await this.isVisible(event, userId))) {
      this.exceptionService.notFoundException(EventExceptionMessages.EVENT_001);
    }

    // 2. count the number of rsvps going for this event
    const { eventRsvps, ...rest } = event;

    // #501: a registration counts once the NGO approved it
    const numberOfPersonsGoingToEvent = eventRsvps.filter(
      (rsvp) => rsvp.going && rsvp.status === EventRegistrationStatus.APPROVED,
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
      registrationStatus: rsvp?.going ? rsvp.status : null,
      rejectionReason:
        rsvp?.going && rsvp.status === EventRegistrationStatus.REJECTED
          ? rsvp.rejectionReason
          : null,
    };
  }

  // The same people who find the event in the app's lists (open / my organizations / going):
  // never a draft; never for a volunteer the NGO blocked; a private event only for the NGO's
  // active volunteers in one of its departments (or all, when it has none). Someone who registered
  // (RSVP) keeps seeing it, also once it is archived or they were made inactive (#589).
  private async isVisible(
    event: IEventModel,
    userId: string,
  ): Promise<boolean> {
    if (!userId || event.status === EventStatus.DRAFT) return false;

    const volunteer: IVolunteerModel = await this.volunteerFacade.find({
      userId,
      organizationId: event.organization?.id,
    });
    if (volunteer?.status === VolunteerStatus.BLOCKED) return false;

    const hasRsvp = (event.eventRsvps ?? []).some(
      (rsvp) => rsvp.user?.id === userId,
    );
    if (hasRsvp) return true;

    if (event.status !== EventStatus.PUBLISHED) return false;
    if (event.isPublic) return true;

    if (volunteer?.status !== VolunteerStatus.ACTIVE) return false;
    const targetIds = (event.targets ?? []).map((target) => target.id);
    const departmentId = volunteer.volunteerProfile?.department?.id;
    return (
      targetIds.length === 0 ||
      (!!departmentId && targetIds.includes(departmentId))
    );
  }
}
