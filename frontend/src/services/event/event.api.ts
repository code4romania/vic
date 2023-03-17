import { EventState } from '../../common/enums/event-state.enum';
import { EventStatus } from '../../common/enums/event-status';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEvent } from '../../common/interfaces/event.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
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
