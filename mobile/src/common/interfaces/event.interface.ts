import { EventRegistrationStatus } from '../enums/event-registration-status.enum';
import { EventVolunteerStatus } from '../enums/event-volunteer-status.enum';
import { IEventListItem } from './event-list-item.interface';

export interface IEvent extends IEventListItem {
  organizationName: string;
  description: string;
  volunteerStatus: EventVolunteerStatus;
  numberOfPersonsGoingToEvent: number;
  // #501: null when not going; only approved registrations count as going
  registrationStatus?: EventRegistrationStatus | null;
  rejectionReason?: string | null;
}
