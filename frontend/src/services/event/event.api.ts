import { EventsTabsStatus } from '../../common/enums/event-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEvent, OrganizationStructureType } from '../../common/interfaces/event.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
// import API from '../api';

export const getEvents = async (
  rowsPerPage: number,
  page: number,
  tabsStatus: EventsTabsStatus,
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
        mention: 'Ala bala portocala',
        description:
          'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
        location: 'Sediu Piata Alba Iulia, sala 02',
        targetedVolunteers: 75,
        targets: [
          { id: '1', name: 'New York Branch', type: OrganizationStructureType.BRANCH, members: 25 },
          {
            id: '2',
            name: 'San Francisco Branch',
            type: OrganizationStructureType.BRANCH,
            members: 18,
          },
        ],
        rsvp: { yes: 75, no: 10 },
        displayStatus: 'published',
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
        targetedVolunteers: 75,
        targets: [
          { id: '1', name: 'New York Branch', type: OrganizationStructureType.BRANCH, members: 25 },
          {
            id: '2',
            name: 'San Francisco Branch',
            type: OrganizationStructureType.BRANCH,
            members: 18,
          },
        ],
        rsvp: { yes: 75, no: 10 },
        displayStatus: 'published',
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
        targets: [],
        rsvp: { yes: 75, no: 10 },
        displayStatus: 'published',
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
    targetedVolunteers: 75,
    targets: [
      { id: '1', name: 'New York Branch', type: OrganizationStructureType.BRANCH, members: 25 },
      {
        id: '2',
        name: 'San Francisco Branch',
        type: OrganizationStructureType.BRANCH,
        members: 18,
      },
    ],
    rsvp: { yes: 75, no: 10 },
    displayStatus: 'published',
    observation:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.',
    reportedHours: '16 hours',
  });
};
