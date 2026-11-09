// #485: an event the volunteer takes part in (approved registration)
export interface IVolunteerEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  hours: number;
}

export interface IVolunteerEvents {
  upcoming: IVolunteerEvent[];
  finished: IVolunteerEvent[];
}

// #480: profile counters
export interface IVolunteerStats {
  totalHours: number;
  events: number;
}
