import { EventRegistrationStatus } from '../enums/event-registration-status.enum';
import { EventVolunteerStatus } from '../enums/event-volunteer-status.enum';
import { IEventListItem } from './event-list-item.interface';

// one of the first volunteers going: initials only (a picture only if the API ever sends one)
export interface ParticipantPreview {
  initials: string;
  avatarUrl?: string;
}

export interface EventParticipants {
  total: number;
  preview: ParticipantPreview[];
}

export interface IEvent extends IEventListItem {
  organizationName: string;
  description: string;
  volunteerStatus: EventVolunteerStatus;
  numberOfPersonsGoingToEvent: number;
  // #501: null when not going; only approved registrations count as going
  registrationStatus?: EventRegistrationStatus | null;
  rejectionReason?: string | null;
  // who is coming, privacy-safe: the count and the initials of the first ones (no names)
  participants?: EventParticipants | null;
}
