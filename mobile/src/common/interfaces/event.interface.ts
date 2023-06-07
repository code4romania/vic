import { IEventListItem } from './event-list-item.interface';

export interface IEvent extends IEventListItem {
  organizationName: string;
  description: string;
  tasks: { id: string; name: string }[];
  status: string; // event status in relation to the volunteer
  numberOfPersonsGoingToEvent: number;
}
