import { AxiosResponseHeaders } from 'axios';
import { EventState } from '../../common/enums/event-state.enum';
import { EventStatus } from '../../common/enums/event-status';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEvent } from '../../common/interfaces/event.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IRsvp } from '../../common/interfaces/rsvp.interface';
import { EventFormTypes, TargetType } from '../../components/EventForm';
import API from '../api';

enum TargetEventType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export const addEvent = async (data: EventFormTypes): Promise<IEvent> => {
  return API.post('event', formatAddEventPayload(data)).then((res) => res.data);
};

export const editEvent = async (
  id: string,
  data: Omit<EventFormTypes, 'status'>,
): Promise<IEvent> => {
  return API.patch(`event/${id}`, formatEditEventPayload(data)).then((res) => res.data);
};

export const getEvent = async (id: string): Promise<IEvent> => {
  return API.get(`event/${id}`).then((res) => res.data);
};

export const getEvents = async (
  limit: number,
  page: number,
  eventState?: EventState,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  departmentId?: string,
): Promise<IPaginatedEntity<IEvent>> => {
  return API.get('/event', {
    params: {
      eventState,
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      departmentId,
    },
  }).then((res) => res.data);
};

export const getEventsForDownload = async (
  eventState: EventState,
  orderBy?: string,
  orderDirection?: OrderDirection,
  departmentId?: string,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  return API.get('event/download', {
    params: {
      eventState,
      orderBy,
      orderDirection,
      departmentId,
    },
    responseType: 'arraybuffer',
  }).then((res) => {
    return { data: res.data, headers: res.headers as AxiosResponseHeaders };
  });
};

export const getRsvps = async (
  id: string,
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  branch?: string,
  department?: string,
  role?: string,
  going?: string,
): Promise<IPaginatedEntity<IRsvp>> => {
  return API.get(`/event/${id}/rsvp`, {
    params: {
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      branch,
      department,
      role,
      going,
    },
  }).then((res) => res.data);
};

export const getEventRSVPsForDownload = async (
  id: string,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  branchId?: string,
  departmentId?: string,
  roleId?: string,
  going?: string,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  return API.get(`event/${id}/rsvp/download`, {
    params: {
      orderBy,
      orderDirection,
      search,
      branchId,
      departmentId,
      roleId,
      going,
    },
    responseType: 'arraybuffer',
  }).then((res) => {
    return { data: res.data, headers: res.headers as AxiosResponseHeaders };
  });
};

// JSON since VIC 2.0 (#492): events have no banner upload any more
const formatAddEventPayload = (data: EventFormTypes): object => {
  const { targets, targetType } = data;

  return {
    name: data.name,
    startDate: data.startDate.toISOString(),
    description: data.description,
    isPublic: targetType === TargetType.PUBLIC ? TargetEventType.PUBLIC : TargetEventType.PRIVATE,
    ...(data.status ? { status: data.status } : {}),
    ...(targetType === TargetType.SELECT
      ? { targetsIds: targets?.map((target) => target.key) }
      : {}),
    ...(data.endDate ? { endDate: data.endDate.toISOString() } : {}),
    ...(data.location ? { location: data.location } : {}),
    ...(data.capacity ? { capacity: data.capacity } : {}),
  };
};

const formatEditEventPayload = (data: EventFormTypes): object => {
  const { targets, targetType, status } = data;

  return {
    name: data.name,
    startDate: data.startDate.toISOString(),
    description: data.description,
    ...(status === EventStatus.DRAFT
      ? {
          isPublic:
            targetType === TargetType.PUBLIC ? TargetEventType.PUBLIC : TargetEventType.PRIVATE,
          ...(targetType === TargetType.SELECT
            ? { targetsIds: targets?.map((target) => target.key) }
            : {}),
        }
      : {}),
    ...(data.endDate ? { endDate: data.endDate.toISOString() } : {}),
    ...(data.location ? { location: data.location } : {}),
    // null clears the limit
    capacity: data.capacity || null,
  };
};

export const archiveEvent = async (id: string): Promise<IEvent> => {
  return API.patch(`/event/${id}/archive`).then((res) => res.data);
};

export const publishEvent = async (id: string): Promise<IEvent> => {
  return API.patch(`/event/${id}/publish`).then((res) => res.data);
};

export const deleteEvent = async (id: string): Promise<IEvent> => {
  return API.delete(`/event/${id}`).then((res) => res.data);
};

//Listing events
export const getEventListItems = async (params: {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<Pick<IEvent, 'id' | 'name'>>> => {
  return API.get('/listing/events', { params }).then((res) => res.data);
};
