import { OrderDirection } from '../../common/enums/order-direction.enum';
import { Sex } from '../../common/enums/sex.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { VolunteerFormTypes } from '../../pages/EditVolunteer';
import { AgeRangeEnum, IVolunteer } from '../../common/interfaces/volunteer.interface';
// import API from '../api';

export const getVolunteers = async (
  filterStatus: VolunteerStatus,
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  age?: AgeRangeEnum,
  branchId?: string,
  departmentId?: string,
  roleId?: string,
  locationId?: string,
  start?: Date,
  end?: Date,
): Promise<IPaginatedEntity<IVolunteer>> => {
  // return API.get('/volunteers', {
  //   params: { limit, page, filterStatus, orderBy, orderDirection, search, age, branchId, departmentId, roleId, locationId, start, end },
  // }).then((res) => res.data);
  console.log(age, branchId, departmentId, roleId, locationId, search, start, end);
  return Promise.resolve({
    items: [
      {
        id: '1',
        createdOn: new Date(),
        createdBy: {
          id: '1',
          name: 'Florian',
          email: 'florian@email.com',
          phone: '+40765555555',
          profilePicture:
            'https://images.pexels.com/photos/6195084/pexels-photo-6195084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          location: {
            id: 1,
            name: 'Iasi',
            county: {
              id: 1,
              abbreviation: 'VS',
              name: 'Vaslui',
            },
          },
          birthday: new Date('2022-01-01'),
          sex: Sex.MALE,
          createdOn: new Date('2022-01-01'),
          updatedOn: new Date('2022-01-01'),
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
    createdOn: new Date(),
    createdBy: {
      id: '1',
      name: 'Florian',
      email: 'florian@email.com',
      phone: '+40765555555',
      profilePicture:
        'https://images.pexels.com/photos/6195084/pexels-photo-6195084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      location: {
        id: 1,
        name: 'Iasi',
        county: {
          id: 1,
          abbreviation: 'VS',
          name: 'Vaslui',
        },
      },
      birthday: new Date('2022-01-01'),
      sex: Sex.MALE,
      createdOn: new Date('2022-01-01'),
      updatedOn: new Date('2022-01-01'),
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

export const updateVolunteer = async (
  id: string,
  data: VolunteerFormTypes,
): Promise<IVolunteer> => {
  console.log({
    ...data,
    branch: data.branch.value,
    role: data.role.value,
    department: data.department.value,
  });
  // return API.patch(`volunteers/${id}/edit`, { ...data, branch: data.branch.value, role: data.role.value, department: data.department.value }).then((res) => res.data);
  return Promise.resolve({
    id: id,
    createdOn: new Date(),
    createdBy: {
      id: '1',
      name: 'Florian',
      email: 'florian@email.com',
      phone: '+40765555555',
      profilePicture:
        'https://images.pexels.com/photos/6195084/pexels-photo-6195084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      location: {
        id: 1,
        name: 'Iasi',
        county: {
          id: 1,
          abbreviation: 'VS',
          name: 'Vaslui',
        },
      },
      birthday: new Date('2022-01-01'),
      sex: Sex.MALE,
      createdOn: new Date('2022-01-01'),
      updatedOn: new Date('2022-01-01'),
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
