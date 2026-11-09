import { EventVolunteerStatus } from '../enums/event-volunteer-status.enum';
import { IEventListItem } from './event-list-item.interface';

export interface IEvent extends IEventListItem {
  organizationName: string;
  description: string;
  volunteerStatus: EventVolunteerStatus;
  numberOfPersonsGoingToEvent: number;
}
