import { EventRegistrationStatus } from '../enums/event-registration-status.enum';

// #501: one volunteer's registration to one of the organization's events
export interface IEventRegistration {
  id: string;
  status: EventRegistrationStatus;
  rejectionReason: string | null;
  decidedOn: Date | null;
  decidedByName: string | null;
  createdOn: Date;
  event: { id: string; name: string; startDate: Date };
  user: { id: string; name: string; email: string };
  volunteerId: string | null;
  // the person's status in the organization; null = not a volunteer there
  volunteerStatus: string | null;
}
