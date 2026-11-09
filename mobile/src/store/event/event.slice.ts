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
    set((state: any) => ({
      event: {
        ...state.event,
        numberOfPersonsGoingToEvent:
          state.event.volunteerStatus === EventVolunteerStatus.JOINED &&
          state.event.registrationStatus === EventRegistrationStatus.APPROVED
            ? state.event.numberOfPersonsGoingToEvent - 1
            : state.event.numberOfPersonsGoingToEvent,
        volunteerStatus: EventVolunteerStatus.NO_RESPONSE,
        registrationStatus: null,
        rejectionReason: null,
      },
    })),
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
