import { EventRegistrationStatus } from '../enums/event-registration-status.enum';

export interface IRsvp {
  id: string;
  going: boolean;
  mention: string;
  userName: string;
  createdOn: Date;
  volunteerId?: string;
  updatedOn: Date;
  logo?: string;
  // #501: null when not going
  status?: EventRegistrationStatus | null;
  rejectionReason?: string | null;
}
