import { EventType } from '../../common/enums/event-type.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEventListItem } from '../../common/interfaces/event-list-item.interface';
import { IEvent } from '../../common/interfaces/event.interface';
import { IOrganizationStructureItem } from '../../common/interfaces/organization-structure-item.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { RsvpResponse } from './event.service';

interface PaginationQuery {
  pageParam?: number;
  orderDirection: OrderDirection;
  search: string;
  eventFilter: EventType;
}

export const getEvents = async ({
  pageParam = 1,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IEventListItem>> => {
  return API.get('/mobile/event', {
    params: {
      limit: 25,
      page: pageParam,
      ...params,
    },
  }).then((res) => res.data);
};

export const getEventsByOrganizationId = async (
  organizationId: string,
): Promise<IOrganizationStructureItem[]> => {
  return API.get(`/mobile/event/organization/${organizationId}`).then((res) => res.data);
};

export const getEvent = async (eventId: string): Promise<IEvent> => {
  return API.get(`/mobile/event/${eventId}`).then((res) => res.data);
};

export const setRsvpEvent = async (eventId: string, payload: RsvpResponse): Promise<void> => {
  return API.patch(`/mobile/event/${eventId}/rsvp`, payload).then((res) => res.data);
};

export const cancelRsvp = async (eventId: string): Promise<void> => {
  return API.delete(`/mobile/event/${eventId}/rsvp`).then((res) => res.data);
};
