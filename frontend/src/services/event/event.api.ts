import { AxiosResponseHeaders } from 'axios';
import { EventState } from '../../common/enums/event-state.enum';
import { EventStatus } from '../../common/enums/event-status';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEvent } from '../../common/interfaces/event.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IRsvp } from '../../common/interfaces/rsvp.interface';
import { EventRegistrationStatus } from '../../common/enums/event-registration-status.enum';
import { IEventRegistration } from '../../common/interfaces/event-registration.interface';
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
  search?: string,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  return API.get('event/download', {
    params: {
      eventState,
      orderBy,
      orderDirection,
      departmentId,
      search,
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
  branch?: string,
  department?: string,
  role?: string,
  going?: string,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  // the same filter names as the list (GetPaginatedEventRSVPsDto): the API strips unknown ones,
  // so other names would export every answer instead of what is on screen
  return API.get(`event/${id}/rsvp/download`, {
    params: {
      orderBy,
      orderDirection,
      search,
      branch,
      department,
      role,
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

// #493: counters for the events page (same department filter as the list)
export interface IEventCounters {
  upcoming: number;
  ongoing: number;
  participants: number;
}

export const getEventCounters = async (departmentId?: string): Promise<IEventCounters> => {
  return API.get('/event/counters', { params: { departmentId } }).then((res) => res.data);
};

// #496: volunteers the NGO can add to an event, and adding them
export interface IEventCandidate {
  volunteerId: string;
  name: string;
  email: string;
  department: string | null;
  totalHours: number;
  registered: boolean;
}

export interface IEventCandidates {
  items: IEventCandidate[];
  // null: the event has no capacity
  placesLeft: number | null;
}

export const getEventCandidates = async (
  eventId: string,
  search?: string,
): Promise<IEventCandidates> => {
  return API.get(`/event/${eventId}/candidates`, {
    params: { search: search || undefined },
  }).then((res) => res.data);
};

export const addVolunteersToEvent = async (
  eventId: string,
  volunteerIds: string[],
): Promise<IEventCandidate[]> => {
  return API.post(`/event/${eventId}/volunteers`, { volunteerIds }).then((res) => res.data);
};

// #497: the columns the NGO can export for the registered volunteers, in the file's order
export const REGISTRATION_EXPORT_FIELDS = [
  'name',
  'email',
  'phone',
  'department',
  'branch',
  'role',
  'hours',
  'registeredOn',
] as const;
export type RegistrationExportField = (typeof REGISTRATION_EXPORT_FIELDS)[number];

export const downloadEventRegistrations = async (
  eventId: string,
  fields: RegistrationExportField[],
): Promise<BlobPart> => {
  return API.get(`event/${eventId}/registrations/download`, {
    params: { fields: fields.join(',') },
    responseType: 'arraybuffer',
  }).then((res) => res.data);
};

// #501: the organization's registrations to its events, and the NGO's decisions
export const getEventRegistrations = async (params: {
  status: EventRegistrationStatus;
  page: number;
  limit: number;
  search?: string;
  eventId?: string;
}): Promise<IPaginatedEntity<IEventRegistration>> => {
  return API.get('/event-registrations', {
    params: { ...params, search: params.search || undefined },
  }).then((res) => res.data);
};

export const approveEventRegistration = async (id: string): Promise<IRsvp> => {
  return API.patch(`/event-registrations/${id}/approve`).then((res) => res.data);
};

export const rejectEventRegistration = async (id: string, reason: string): Promise<IRsvp> => {
  return API.patch(`/event-registrations/${id}/reject`, { reason }).then((res) => res.data);
};
