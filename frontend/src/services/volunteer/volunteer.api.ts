import { OrderDirection } from '../../common/enums/order-direction.enum';
import { Sex } from '../../common/enums/sex.enum';
import { IAccessRequestDetails } from '../../common/interfaces/access-request.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { VolunteerFormData } from '../../pages/EditVolunteer';
import { IVolunteer, VolunteerStatus } from '../../pages/Volunteers';
import API from '../api';

export const getAccessRequest = async (id: string): Promise<IAccessRequestDetails> => {
  console.log('id', id);
  // return API.get(`/volunteers/access-request/${id}`).then((res) => res.data);
  return Promise.resolve({
    id: 'shshhs',
    name: 'Yoyo',
    logo: 'https://plus.unsplash.com/premium_photo-1661692476630-06945685910e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    age: 16,
    sex: Sex.FEMALE,
    location: 'Iasi, Jud. Iasi',
    email: 'email@email.com',
    phone: '079999999',
    createdOn: new Date(),
    answers: ['Dog ate my homework', 'Cat ate my homework'],
  });
};

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
        age: 30,
        sex: Sex.MALE,
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
        createdOn: new Date('2021-02-01'),
      },
      {
        id: '2',
        organization: 'Red Cross',
        name: 'Gigica',
        age: 30,
        sex: Sex.MALE,
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
        createdOn: new Date('2017-11-01'),
      },
      {
        id: '3',
        organization: 'Red Cross',
        city: 'Ciorogarla',
        county: 'Ilfov',
        age: 30,
        sex: Sex.MALE,
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
        createdOn: new Date('2028-01-01'),
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

export const getVolunteer = async (id: string): Promise<IVolunteer> => {
  // return API.get(`volunteers/${id}`).then((res) => res.data);
  return Promise.resolve({
    id,
    name: 'John Doe',
    city: 'New York',
    age: 30,
    sex: Sex.MALE,
    county: 'US',
    organization: 'Red Cross',
    profilePicture: 'https://i.pravatar.cc/300',
    role: 'Volunteer',
    department: 'Disaster Relief',
    branch: 'New York',
    startedOn: new Date('2016-03-04'),
    email: 'johndoe@example.com',
    phone: '+1 123 456 7890',
    status: VolunteerStatus.ARCHIVED,
    archivedOn: new Date('2022-01-01'),
    blockedOn: new Date('2022-01-01'),
    archivedBy: 'mircea',
    blockedBy: 'ion',
    createdOn: new Date('2022-01-01'),
  });
};

export const updateVolunteer = async (id: string, data: VolunteerFormData): Promise<IVolunteer> => {
  return API.patch(`volunteers/${id}/edit`, data).then((res) => res.data);
};
