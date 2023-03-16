import { EventState } from '../../common/enums/event-state.enum';
import { EventStatus } from '../../common/enums/event-status';
import { GoingStatus } from '../../common/enums/going.enum';
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
  eventState: EventState,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IEvent>> => {
  return API.get('/event', {
    params: {
      eventState,
      limit,
      page,
      orderBy,
      orderDirection,
    },
  }).then((res) => res.data);
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
  // return API.get(`/event/${id}/rsvp`, {
  //   params: {
  //     limit,
  //     page,
  //     orderBy,
  //     orderDirection,
  //     search,
  //     branchId,
  //     departmentId,
  //     roleId,
  //     going: going === undefined ? going : going === GoingStatus.GOING,
  //   },
  // }).then((res) => res.data);
  console.log(
    id,
    limit,
    page,
    orderBy,
    orderDirection,
    search,
    branchId,
    departmentId,
    roleId,
    going === undefined ? going : going === GoingStatus.GOING,
  );
  return Promise.resolve({
    items: [
      {
        id: '1',
        going: true,
        mention: 'Excited to attend!',
        userName: 'John Doe',
        createdOn: new Date('2022-03-14'),
        updatedOn: new Date('2022-03-14'),
        logo: 'https://example.com/logo.png',
        volunteerId: '23232',
      },
      {
        id: '2',
        going: false,
        mention: 'Unfortunately cannot make it.',
        userName: 'JaneSmith',
        createdOn: new Date('2022-03-12'),
        updatedOn: new Date('2022-03-13'),
      },
      {
        id: '3',
        going: true,
        mention: 'Looking forward to it!',
        userName: 'BobJohnson',
        createdOn: new Date('2022-03-10'),
        updatedOn: new Date('2022-03-11'),
        logo: 'https://example.com/logo.png',
      },
      {
        id: '4',
        going: true,
        mention: "Can't wait!",
        userName: 'AliceLee',
        createdOn: new Date('2022-03-09'),
        updatedOn: new Date('2022-03-15'),
        logo: 'https://example.com/logo.png',
      },
    ],
    meta: {
      currentPage: 1,
      itemCount: 10,
      itemsPerPage: 20,
      totalItems: 200,
      totalPages: 10,
      orderByColumn: 'createdAt',
      orderDirection: OrderDirection.DESC,
    },
  });
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
