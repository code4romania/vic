import { EventVolunteerStatus } from '../enums/event-volunteer-status.enum';
import { IEventListItem } from './event-list-item.interface';
import { ITask } from './task.interface';

export interface IEvent extends IEventListItem {
  organizationName: string;
  description: string;
  tasks: ITask[];
  volunteerStatus: EventVolunteerStatus;
  numberOfPersonsGoingToEvent: number;
}
