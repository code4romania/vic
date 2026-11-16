import { EventRegistrationStatus } from '../../common/enums/event-registration-status.enum';
import { EventVolunteerStatus } from '../../common/enums/event-volunteer-status.enum';
import { IEvent } from '../../common/interfaces/event.interface';

export const eventSlice = (set: any) => ({
  event: undefined,
  setEvent: (event: IEvent) => {
    set({ event });
  },
  joinEvent: () =>
    set((state: any) => ({
      event: {
        ...state.event,
        // #501: the registration may wait for the NGO; the screen reloads the event for its status
        volunteerStatus: EventVolunteerStatus.JOINED,
      },
    })),
  canceRsvp: () =>
    set((state: any) => {
      // only an approved „particip” was counted, so only that one comes off the totals
      const wasCounted =
        state.event.volunteerStatus === EventVolunteerStatus.JOINED &&
        state.event.registrationStatus === EventRegistrationStatus.APPROVED;
      const participants = state.event.participants;
      return {
        event: {
          ...state.event,
          numberOfPersonsGoingToEvent: wasCounted
            ? state.event.numberOfPersonsGoingToEvent - 1
            : state.event.numberOfPersonsGoingToEvent,
          // the faces follow the caption right away; the screen then reloads the event for the
          // initials themselves (the volunteer's own may be among them)
          participants:
            wasCounted && participants
              ? { ...participants, total: Math.max(0, participants.total - 1) }
              : participants,
          volunteerStatus: EventVolunteerStatus.NO_RESPONSE,
          registrationStatus: null,
          rejectionReason: null,
        },
      };
    }),
  declineEvent: () =>
    set((state: any) => ({
      event: {
        ...state.event,
        volunteerStatus: EventVolunteerStatus.DECLINED,
        registrationStatus: null,
        rejectionReason: null,
      },
    })),
});

export default { eventSlice };
