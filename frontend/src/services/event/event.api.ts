import { AxiosResponseHeaders } from 'axios';
import { EventState } from '../../common/enums/event-state.enum';
import { EventStatus } from '../../common/enums/event-status';
import { RsvpEnum } from '../../common/enums/rsvp.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEvent } from '../../common/interfaces/event.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IRsvp } from '../../common/interfaces/rsvp.interface';
import { EventFormTypes, TargetType } from '../../components/EventForm';
import API from '../api';

export const addEvent = async (data: EventFormTypes): Promise<IEvent> => {
  return API.post('event', { ...formatAddEventPayload(data) }).then((res) => res.data);
};

export const editEvent = async (
  id: string,
  data: Omit<EventFormTypes, 'status'>,
): Promise<IEvent> => {
  return API.patch(`event/${id}`, { ...formatEditEventPayload(data) }).then((res) => res.data);
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
): Promise<IPaginatedEntity<IEvent>> => {
  return API.get('/event', {
    params: {
      eventState,
      limit,
      page,
      orderBy,
      orderDirection,
      search,
    },
  }).then((res) => res.data);
};

export const getEventsForDownload = async (
  eventState: EventState,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  return API.get('event/download', {
    params: {
      eventState,
      orderBy,
      orderDirection,
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
  branchId?: string,
  departmentId?: string,
  roleId?: string,
  going?: string,
): Promise<IPaginatedEntity<IRsvp>> => {
  return API.get(`/event/${id}/rsvp`, {
    params: {
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      branchId,
      departmentId,
      roleId,
      going: going === undefined ? going : going === RsvpEnum.GOING,
    },
  }).then((res) => res.data);
};

const formatAddEventPayload = (data: EventFormTypes): object => {
  const { targets, tasks, targetType, ...payload } = data;
  return {
    ...payload,
    tasksIds: tasks.map((task) => task.key),
    isPublic: targetType === TargetType.PUBLIC,
    ...(targetType === TargetType.SELECT
      ? { targetsIds: targets.map((target) => target.key) }
      : { targetsIds: [] }),
  };
};

const formatEditEventPayload = (data: EventFormTypes): object => {
  const { targets, tasks, targetType, status, ...payload } = data;

  return {
    ...payload,
    tasksIds: tasks.map((task) => task.key),
    ...(status === EventStatus.DRAFT
      ? {
          ...(targetType === TargetType.SELECT
            ? { targetsIds: targets.map((target) => target.key) }
            : { targetsIds: [] }),
        }
      : {}),
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
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<Pick<IEvent, 'id' | 'name'>>> => {
  return API.get('/listing/events', { params }).then((res) => res.data);
};
