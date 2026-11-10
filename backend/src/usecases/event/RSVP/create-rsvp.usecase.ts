import { Injectable } from '@nestjs/common';
import { compareAsc } from 'date-fns';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventRSVPExceptionMessages } from 'src/modules/event/exceptions/event-rsvp.exceptions';
import {
  CreateEventRSVPOptions,
  IEventRSVPModel,
} from 'src/modules/event/models/event-rsvp.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneRegularUserUseCase } from 'src/usecases/user/get-one-regular-user.usecase';
import { GetOneEventUseCase } from '../get-one-event.usecase';
import { OrganizationGateService } from 'src/usecases/organization/organization-gate.service';

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
    private readonly organizationGate: OrganizationGateService,
  ) {}

  public async execute(data: CreateEventRSVPOptions): Promise<IEventRSVPModel> {
    // 1. Check if the event exists and is PUBLISHED
    const event = await this.getOneEventUseCase.execute({ id: data.eventId });

    if (event.status !== EventStatus.PUBLISHED) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_006,
      );
    }

    // 1b. M7: no registrations for the events of a suspended or not yet validated NGO (403 ORG_005)
    await this.organizationGate.assertValidated(event.organization?.id);

    // 2. check if the event has passed
    if (event.endDate && compareAsc(new Date(event.endDate), new Date()) < 1) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_007,
      );
    }

    // 3. Check if the user to attend, exists
    await this.getOneRegularUserUseCase.execute({ id: data.userId });

    const volunteer = await this.volunteerFacade.find({
      userId: data.userId,
      organizationId: event.organization.id,
    });

    // 4. If the volunteer is blocked the user should not be able to join the event
    if (volunteer?.status === VolunteerStatus.BLOCKED) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_003,
      );
    }

    // 4b. A volunteer the NGO made inactive can only view the NGO and its documents
    if (
      volunteer?.status === VolunteerStatus.INACTIVE &&
      volunteer.archivedById !== data.userId
    ) {
      this.exceptionsService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_007,
      );
    }

    // 5. For "private" events, check if the USER is VOLUNTEER in the ORGANIZATION of the EVENT
    if (!event.isPublic && !volunteer) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_002,
      );
    }

    // 6. For private events volunteers must have the profile completed to RSVP.
    if (!event.isPublic && volunteer && !volunteer.volunteerProfile) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_005,
      );
    }

    // 7. #501: "going" is a registration. Volunteers already in the organization (active, with a
    // profile) and in one of the event's departments (or the event targets everyone) are approved
    // automatically; everyone else waits for the NGO's decision. Not going has no status.
    const targetIds = (event.targets ?? []).map((target) => target.id);
    const departmentId = volunteer?.volunteerProfile?.department?.id;
    const autoApproved =
      volunteer?.status === VolunteerStatus.ACTIVE &&
      !!volunteer.volunteerProfile &&
      (targetIds.length === 0 ||
        (!!departmentId && targetIds.includes(departmentId)));

    // 8. B7: the capacity is checked and the answer saved under a lock on the event, so concurrent
    // answers cannot take more seats than the event has.
    const rsvpId = await this.eventFacade.withEventLock(
      data.eventId,
      async (tx) => {
        const existing = await tx.findStatus(data.userId);
        if (existing && existing.going === data.going) return existing.id;

        // M13: a volunteer the NGO rejected for this event keeps the rejection when they cancel,
        // and answering "going" again goes back to the NGO (never approved automatically). The
        // rejection reason stays on the registration as the marker until the NGO approves it.
        const wasRejected =
          existing?.status === EventRegistrationStatus.REJECTED ||
          !!existing?.rejectionReason;

        if (!data.going && !existing) {
          return tx.create({ ...data, mention: null, status: null });
        }
        if (!data.going) {
          await tx.update(
            existing.id,
            wasRejected
              ? { going: false, status: EventRegistrationStatus.REJECTED }
              : {
                  going: false,
                  status: null,
                  rejectionReason: null,
                  decidedOn: null,
                  decidedById: null,
                },
          );
          return existing.id;
        }

        // A full event takes no new registrations (pending ones included): 400 EVENT_RSVP_008
        if (tx.capacity && (await tx.countApproved()) >= tx.capacity) {
          this.exceptionsService.badRequestException(
            EventRSVPExceptionMessages.EVENT_RSVP_008,
          );
        }

        const status =
          autoApproved && !wasRejected
            ? EventRegistrationStatus.APPROVED
            : EventRegistrationStatus.PENDING;

        if (existing) {
          await tx.update(
            existing.id,
            wasRejected
              ? { going: true, status, decidedOn: null, decidedById: null }
              : {
                  going: true,
                  status,
                  rejectionReason: null,
                  decidedOn: null,
                  decidedById: null,
                },
          );
          return existing.id;
        }

        // 9. VIC 2.0 (#492): events have no "registration with mention" any more;
        // mentions given before stay on their RSVPs, new ones are not collected.
        return tx.create({ ...data, mention: null, status });
      },
    );

    return this.eventFacade.findRSVP({ id: rsvpId });
  }
}
