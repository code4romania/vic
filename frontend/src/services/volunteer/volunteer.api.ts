import { OrderDirection } from '../../common/enums/order-direction.enum';
import { Sex } from '../../common/enums/sex.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { IAccessRequestDetails } from '../../common/interfaces/access-request.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IVolunteer } from '../../common/interfaces/volunteer.interface';
// import API from '../api';

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
        createdBy: {
          id: '1',
          name: 'Florian',
          email: 'florian@email.com',
          phone: '+40765555555',
          profilePicture:
            'https://images.pexels.com/photos/6195084/pexels-photo-6195084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          location: 'Iasi, jus Iasi',
          birthday: new Date('2022-01-01'),
          sex: Sex.MALE,
          createdOn: new Date('2022-01-01'),
        },
        role: { id: '1', name: 'Prof' },
        department: { id: '1', name: 'Dep' },
        branch: { id: '1', name: 'Iasi' },
        startedOn: new Date(),
        email: 'florian@email.com',
        phone: '+40765555555',
        status: VolunteerStatus.ACTIVE,
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
    id: id,
    createdBy: {
      id: '1',
      name: 'Florian',
      email: 'florian@email.com',
      phone: '+40765555555',
      profilePicture:
        'https://images.pexels.com/photos/6195084/pexels-photo-6195084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      location: 'Iasi, jus Iasi',
      birthday: new Date('2022-01-01'),
      sex: Sex.MALE,
      createdOn: new Date('2022-01-01'),
    },
    role: { id: '1', name: 'Prof' },
    department: { id: '1', name: 'Dep' },
    branch: { id: '1', name: 'Iasi' },
    startedOn: new Date(),
    email: 'florian@email.com',
    phone: '+40765555555',
    status: VolunteerStatus.ACTIVE,
  });
};
