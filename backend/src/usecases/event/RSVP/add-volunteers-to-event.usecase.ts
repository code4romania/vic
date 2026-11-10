import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventRSVPExceptionMessages } from 'src/modules/event/exceptions/event-rsvp.exceptions';
import { IEventCandidateModel } from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { hasEventEnded } from 'src/modules/event/event-end';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import VolunteerAddedToEventEvent from 'src/modules/notifications/events/ngo-event/volunteer-added.event';
import { OrganizationGateService } from 'src/usecases/organization/organization-gate.service';
import { GetOneEventUseCase } from '../get-one-event.usecase';

// VIC 2.0 (#496): the NGO registers volunteers to an event directly. They are "going" right away (no
// acceptance in the app) and get a push and an email. Only active volunteers with a profile, from the
// event's departments; the capacity is respected.
@Injectable()
export class AddVolunteersToEventUseCase
  implements IUseCaseService<IEventCandidateModel[]>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly organizationGate: OrganizationGateService,
    private readonly exceptionsService: ExceptionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute({
    eventId,
    organizationId,
    volunteerIds,
    adminId,
  }: {
    eventId: string;
    organizationId: string;
    volunteerIds: string[];
    adminId?: string;
  }): Promise<IEventCandidateModel[]> {
    await this.organizationGate.assertValidated(organizationId);

    const event = await this.getOneEventUseCase.execute({
      id: eventId,
      organizationId,
    });

    if (event.status !== EventStatus.PUBLISHED) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_006,
      );
    }
    if (hasEventEnded(event)) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_007,
      );
    }

    const ids = [...new Set(volunteerIds)];
    const candidates = await this.eventFacade.findCandidates({
      eventId,
      organizationId,
      departmentIds: event.targets?.map((target) => target.id),
      volunteerIds: ids,
    });
    if (candidates.length !== ids.length) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_009,
      );
    }

    // #501: added by the NGO = an approved registration (a pending or rejected one becomes approved).
    // B7: the capacity check and the writes happen under a lock on the event.
    const decision = {
      status: EventRegistrationStatus.APPROVED,
      decidedById: adminId ?? null,
      decidedOn: new Date(),
    };
    const toAdd = await this.eventFacade.withEventLock(eventId, async (tx) => {
      const pending = [];
      for (const candidate of candidates) {
        const existing = await tx.findStatus(candidate.userId);
        if (
          existing?.going &&
          existing.status === EventRegistrationStatus.APPROVED
        ) {
          continue;
        }
        pending.push({ candidate, existing });
      }
      if (
        tx.capacity &&
        (await tx.countApproved()) + pending.length > tx.capacity
      ) {
        this.exceptionsService.badRequestException(
          EventRSVPExceptionMessages.EVENT_RSVP_008,
        );
      }
      for (const { candidate, existing } of pending) {
        if (existing) {
          await tx.update(existing.id, {
            going: true,
            rejectionReason: null,
            ...decision,
          });
        } else {
          await tx.create({
            eventId,
            userId: candidate.userId,
            going: true,
            mention: null,
            ...decision,
          });
        }
      }
      return pending.map(({ candidate }) => candidate);
    });

    if (toAdd.length) {
      this.eventEmitter.emit(
        EVENTS.NGO_EVENT.VOLUNTEER_ADDED,
        new VolunteerAddedToEventEvent(
          organizationId,
          toAdd.map((candidate) => candidate.userId),
          event.organization?.name,
          toAdd.map((candidate) => candidate.email).filter(Boolean),
          event.id,
          event.name,
        ),
      );
    }

    return toAdd.map((candidate) => ({ ...candidate, registered: true }));
  }
}
