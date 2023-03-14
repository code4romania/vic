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
  const { targets, tasks, targetType, ...payload } = data;

  return API.post('event', {
    ...payload,
    tasksIds: tasks.map((task) => task.key),
    ...(targetType === TargetType.PUBLIC ? { isPublic: true } : {}),
    ...(targetType === TargetType.SELECT ? { targetIds: targets.map((target) => target.key) } : {}),
  }).then((res) => res.data);
};

export const getEvents = async (
  rowsPerPage: number,
  page: number,
  tabsStatus: EventsTabs,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IEvent>> => {
  return API.get('/event', {
    params: {
      type: tabsStatus,
      limit: rowsPerPage,
      page,
      orderBy: orderByColumn,
      orderDirection,
    },
  }).then((res) => res.data);
};

export const getEvent = async (id: string): Promise<IEvent> => {
  // return API.get(`events/${id}`).then((res) => res.data);
  return Promise.resolve({
    id,
    name: 'Maraton',
    logo: '',
    description:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
    startDate: new Date('2023-09-24T09:12:00'),
    endDate: new Date('2023-09-24T17:32:00'),
    location: 'Sediu Piata Alba Iulia, sala 02',
    isPublic: true,
    attendanceType: AttendanceType.SIMPLE,
    attendanceMention: '',
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
    status: EventStatus.DRAFT,
    observation:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
    reportedHours: '16 hours',
  });
};

export const editEvent = async (id: string, data: Omit<unknown, 'status'>): Promise<IEvent> => {
  console.log(data);
  // return API.patch(`events/${id}`, { ...data }).then((res) => res.data);
  return Promise.resolve({
    id,
    name: 'Maraton',
    logo: '',
    description:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
    startDate: new Date('2023-09-24T09:12:00'),
    endDate: new Date('2023-09-24T17:32:00'),
    location: 'Sediu Piata Alba Iulia, sala 02',
    isPublic: true,
    attendanceType: AttendanceType.MENTION,
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
    status: EventStatus.DRAFT,
    observation:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
    reportedHours: '16 hours',
  });
};
