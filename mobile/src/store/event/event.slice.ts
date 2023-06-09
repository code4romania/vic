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
        numberOfPersonsGoingToEvent: state.event.numberOfPersonsGoingToEvent + 1,
        volunteerStatus: EventVolunteerStatus.JOINED,
      },
    })),
  canceRsvp: () =>
    set((state: any) => ({
      event: {
        ...state.event,
        numberOfPersonsGoingToEvent:
          state.event.volunteerStatus === EventVolunteerStatus.JOINED
            ? state.event.numberOfPersonsGoingToEvent - 1
            : state.event.numberOfPersonsGoingToEvent,
        volunteerStatus: EventVolunteerStatus.NO_RESPONSE,
      },
    })),
  declineEvent: () =>
    set((state: any) => ({
      event: {
        ...state.event,
        volunteerStatus: EventVolunteerStatus.DECLINED,
      },
    })),
});

export default { eventSlice };
