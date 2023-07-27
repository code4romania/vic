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
  return API.post('event', formatAddEventPayload(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const editEvent = async (
  id: string,
  data: Omit<EventFormTypes, 'status'>,
): Promise<IEvent> => {
  return API.patch(`event/${id}`, formatEditEventPayload(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
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

const formatAddEventPayload = (data: EventFormTypes): FormData => {
  const { targets, tasks, targetType } = data;
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('startDate', data.startDate.toISOString());
  formData.append('description', data.description);
  formData.append('attendanceType', data.attendanceType);
  formData.append(
    'isPublic',
    targetType === TargetType.PUBLIC ? TargetEventType.PUBLIC : TargetEventType.PRIVATE,
  );

  if (data.status) {
    formData.append('status', data.status);
  }

  tasks.forEach((taks) => {
    formData.append('tasksIds[]', taks.key);
  });

  if (targetType === TargetType.SELECT) {
    targets.forEach((target) => {
      formData.append('targetsIds[]', target.key);
    });
  }

  if (data.endDate) {
    formData.append('endDate', data.endDate.toISOString());
  }

  if (data.logo) {
    formData.append('poster', data.logo);
  }

  if (data.location) {
    formData.append('location', data.location);
  }

  if (data.attendanceMention) {
    formData.append('attendanceMention', data.attendanceMention);
  }

  if (data.observation) {
    formData.append('observation', data.observation);
  }

  return formData;
};

const formatEditEventPayload = (data: EventFormTypes): object => {
  const { targets, tasks, targetType, status } = data;
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('startDate', data.startDate.toISOString());
  formData.append('description', data.description);
  formData.append('attendanceType', data.attendanceType);

  if (status === EventStatus.DRAFT) {
    formData.append(
      'isPublic',
      targetType === TargetType.PUBLIC ? TargetEventType.PUBLIC : TargetEventType.PRIVATE,
    );

    if (targetType === TargetType.SELECT) {
      targets.forEach((target) => {
        formData.append('targetsIds[]', target.key);
      });
    }
  }

  tasks.forEach((taks) => {
    formData.append('tasksIds[]', taks.key);
  });

  if (data.endDate) {
    formData.append('endDate', data.endDate.toISOString());
  }

  if (data.logo) {
    formData.append('poster', data.logo);
  }

  if (data.location) {
    formData.append('location', data.location);
  }

  if (data.attendanceMention) {
    formData.append('attendanceMention', data.attendanceMention);
  }

  if (data.observation) {
    formData.append('observation', data.observation);
  }

  return formData;
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
