import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IVolunteer, VolunteerStatus } from '../../pages/Volunteers';
// import API from '../api';

export const getVolunteers = async (
  filterStatus: VolunteerStatus,
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IVolunteer>> => {
  // return API.get('/volunteers', {
  //   params: { limit, page, filterStatus, orderBy, orderDirection },
  // }).then((res) => res.data);
  return Promise.resolve({
    items: [
      {
        id: '1',
        city: 'Ciorogarla',
        county: 'Ilfov',
        name: 'Nume varianta 1',
        organization: 'Red Cross',
        profilePicture: 'logo.svg',
        role: 'Volunteer',
        department: 'Disaster Relief',
        branch: 'New York',
        startedOn: new Date('2022-01-01'),
        email: 'volunteer1@redcross.org',
        phone: '+1 123 456 7890',
        status: VolunteerStatus.ACTIVE,
        archivedOn: new Date(),
        blockedOn: new Date(),
        archivedBy: 'Mircea',
        blockedBy: 'Ionica',
      },
      {
        id: '2',
        organization: 'Red Cross',
        name: 'Gigica',
        city: 'Ciorogarla',
        county: 'Ilfov',
        profilePicture: 'logo.svg',
        role: 'Team Lead',
        department: 'Disaster Relief',
        branch: 'Los Angeles',
        startedOn: new Date('2022-02-01'),
        email: 'volunteer2@redcross.org',
        phone: '+1 123 456 7891',
        status: VolunteerStatus.ACTIVE,
        archivedOn: new Date(),
        blockedOn: new Date(),
        archivedBy: 'Mircea',
        blockedBy: 'Ionica',
      },
      {
        id: '3',
        organization: 'Red Cross',
        city: 'Ciorogarla',
        county: 'Ilfov',
        name: 'Stefanut',
        profilePicture: 'logo.svg',
        role: 'Volunteer',
        department: 'Disaster Relief',
        branch: 'Chicago',
        startedOn: new Date('2022-03-01'),
        email: 'volunteer3@redcross.org',
        phone: '+1 123 456 7892',
        status: VolunteerStatus.ACTIVE,
        archivedOn: new Date(),
        blockedOn: new Date(),
        archivedBy: 'Mircea',
        blockedBy: 'Ionica',
      },
    ],
    meta: {
      status: filterStatus,
      currentPage: page,
      itemCount: 3,
      itemsPerPage: limit,
      totalItems: 7,
      totalPages: 2,
      orderByColumn: orderBy || 'name',
      orderDirection: orderDirection || OrderDirection.ASC,
    },
  });
};
