import { EventsTabs } from '../../common/enums/events-tabs.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEvent } from '../../common/interfaces/event.interface';
import { DivisionType } from '../../common/enums/division-type.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { EventStatus } from '../../common/enums/event-status';
import { AttendanceType } from '../../common/enums/attendance-type.enum';
import { EventFormTypes, TargetType } from '../../components/EventForm';
import API from '../api';

export const addEvent = async (data: EventFormTypes): Promise<IEvent> => {
  return API.post('event', { ...formatEventPayload(data) }).then((res) => res.data);
};

export const editEvent = async (
  id: string,
  data: Omit<EventFormTypes, 'status'>,
): Promise<IEvent> => {
  return API.patch(`event/${id}`, { ...formatEventPayload(data) }).then((res) => res.data);
};

export const getEvent = async (id: string): Promise<IEvent> => {
  return API.get(`event/${id}`).then((res) => res.data);
};

export const getEvents = async (
  rowsPerPage: number,
  page: number,
  tabsStatus: EventsTabs,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IEvent>> => {
  // return API.get('/events', {
  //   params: {
  //     type: tabsStatus,
  //     limit: rowsPerPage,
  //     page,
  //     orderBy: orderByColumn,
  //     orderDirection,
  //   },
  // }).then((res) => res.data);
  console.log(rowsPerPage, page, tabsStatus, orderByColumn, orderDirection);
  return Promise.resolve({
    items: [
      {
        id: '121212211',
        name: 'Annual Company Conference',
        startDate: new Date('2023-09-24T09:12:00'),
        endDate: new Date('2023-09-24T17:32:00'),
        attendanceType: AttendanceType.MENTION,
        attendanceMention: 'Acesta mentiunea este frumoasa',
        mention: 'Ala bala portocala',
        isPublic: true,
        description:
          'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
        location: 'Sediu Piata Alba Iulia, sala 02',
        targetedVolunteers: 75,
        targets: [
          { id: '1', name: 'New York Branch', type: DivisionType.BRANCH, members: 25 },
          {
            id: '2',
            name: 'San Francisco Branch',
            type: DivisionType.BRANCH,
            members: 18,
          },
          { id: '3', name: 'New York Branch', type: DivisionType.BRANCH, members: 25 },
          {
            id: '4',
            name: 'San Francisco Branch',
            type: DivisionType.BRANCH,
            members: 18,
          },
          { id: '1', name: 'New York Branch', type: DivisionType.BRANCH, members: 25 },
          {
            id: '5',
            name: 'San Francisco Branch',
            type: DivisionType.BRANCH,
            members: 18,
          },
        ],
        tasks: [
          { id: '1', name: 'Ciclism' },
          {
            id: '2',
            name: 'Pescuit',
          },
        ],
        rsvp: { yes: 75, no: 10 },
        status: EventStatus.ARCHIVED,
        reportedHours: '16 hours',
      },
      {
        id: '122881',
        name: 'Maraton',
        logo: 'logo.svg',
        location: 'Sediu Piata Alba Iulia, sala 02',
        description:
          'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
        startDate: new Date('2023-09-24T09:12:00'),
        endDate: new Date('2023-09-24T17:32:00'),
        attendanceType: AttendanceType.MENTION,
        isPublic: true,
        attendanceMention: 'Acesta mentiunea este frumoasa',
        targetedVolunteers: 75,
        targets: [
          { id: '1', name: 'New York Branch', type: DivisionType.BRANCH, members: 25 },
          {
            id: '2',
            name: 'San Francisco Branch',
            type: DivisionType.BRANCH,
            members: 18,
          },
        ],
        tasks: [
          { id: '1', name: 'Ciclism' },
          {
            id: '2',
            name: 'Pescuit',
          },
        ],
        rsvp: { yes: 75, no: 10 },
        status: EventStatus.PUBLISHED,
        reportedHours: '16 hours',
      },
      {
        id: '855468',
        name: 'Ciclism',
        startDate: new Date('2023-09-24T09:12:00'),
        endDate: new Date('2023-09-24T17:32:00'),
        description:
          'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
        location: 'Sediu Piata Alba Iulia, sala 02',
        targetedVolunteers: 75,
        attendanceType: AttendanceType.MENTION,
        isPublic: true,
        attendanceMention: 'Acesta mentiunea este frumoasa',
        targets: [],
        tasks: [
          { id: '1', name: 'Ciclism' },
          {
            id: '2',
            name: 'Pescuit',
          },
        ],
        rsvp: { yes: 75, no: 10 },
        status: EventStatus.DRAFT,
        reportedHours: '16 hours',
      },
    ],
    meta: {
      itemCount: 0,
      totalItems: 0,
      itemsPerPage: 10,
      totalPages: 0,
      currentPage: 1,
    },
  });
};

const formatEventPayload = (data: EventFormTypes): object => {
  const { targets, tasks, targetType, ...payload } = data;
  return {
    ...payload,
    tasksIds: tasks.map((task) => task.key),
    isPublic: targetType === TargetType.PUBLIC,
    ...(targetType === TargetType.SELECT
      ? { targetsIds: targets.map((target) => target.key) }
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
