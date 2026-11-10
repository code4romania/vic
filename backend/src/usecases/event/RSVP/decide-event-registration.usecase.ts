import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { EventRSVPExceptionMessages } from 'src/modules/event/exceptions/event-rsvp.exceptions';
import { IEventRSVPModel } from 'src/modules/event/models/event-rsvp.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { hasEventEnded } from 'src/modules/event/event-end';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import RegistrationDecidedEvent from 'src/modules/notifications/events/ngo-event/registration-decided.event';
import { OrganizationGateService } from 'src/usecases/organization/organization-gate.service';
import { GetOneEventUseCase } from '../get-one-event.usecase';

export type DecideEventRegistrationOptions = {
  id: string;
  organizationId: string;
  adminId: string;
} & (
  | { status: EventRegistrationStatus.APPROVED }
  | { status: EventRegistrationStatus.REJECTED; reason: string }
);

// VIC 2.0 (#501): the NGO approves or rejects a registration (a "going" answer). Rejecting needs a
// reason. A decision can be changed either way, until the event ends; the volunteer is notified.
// Approving respects the event's capacity.
@Injectable()
export class DecideEventRegistrationUseCase
  implements IUseCaseService<IEventRSVPModel>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly organizationGate: OrganizationGateService,
    private readonly exceptionsService: ExceptionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    options: DecideEventRegistrationOptions,
  ): Promise<IEventRSVPModel> {
    const { id, organizationId, adminId, status } = options;
    await this.organizationGate.assertValidated(organizationId);

    const rsvp = await this.eventFacade.findRSVP({ id });
    const event = rsvp?.going
      ? await this.getOneEventUseCase
          .execute({ id: rsvp.event.id })
          .catch(() => null)
      : null;
    if (!event || event.organization?.id !== organizationId) {
      this.exceptionsService.notFoundException(
        EventRSVPExceptionMessages.EVENT_RSVP_010,
      );
    }
    if (hasEventEnded(event)) {
      this.exceptionsService.badRequestException(
        EventRSVPExceptionMessages.EVENT_RSVP_007,
      );
    }

    const reason =
      options.status === EventRegistrationStatus.REJECTED
        ? options.reason
        : null;
    if (rsvp.status === status && rsvp.rejectionReason === reason) {
      return rsvp;
    }

    // B7: approving takes a seat; the count and the write happen under a lock on the event
    await this.eventFacade.withEventLock(event.id, async (tx) => {
      if (
        status === EventRegistrationStatus.APPROVED &&
        rsvp.status !== EventRegistrationStatus.APPROVED &&
        tx.capacity &&
        (await tx.countApproved()) >= tx.capacity
      ) {
        this.exceptionsService.badRequestException(
          EventRSVPExceptionMessages.EVENT_RSVP_008,
        );
      }
      await tx.update(id, {
        going: true,
        status,
        rejectionReason: reason,
        decidedById: adminId,
        decidedOn: new Date(),
      });
    });
    const updated = await this.eventFacade.findRSVP({ id });

    const settings = rsvp.user?.notificationsSettings;
    this.eventEmitter.emit(
      status === EventRegistrationStatus.APPROVED
        ? EVENTS.NGO_EVENT.REGISTRATION_APPROVED
        : EVENTS.NGO_EVENT.REGISTRATION_REJECTED,
      new RegistrationDecidedEvent(
        organizationId,
        rsvp.user.id,
        event.organization?.name,
        settings?.notificationsViaPush ?? true,
        settings?.notificationsViaEmail ?? true,
        rsvp.user.email,
        event.id,
        event.name,
        reason,
      ),
    );

    return updated;
  }
}
