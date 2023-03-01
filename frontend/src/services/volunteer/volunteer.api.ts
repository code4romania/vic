import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { VolunteerFormTypes } from '../../pages/EditVolunteer';
import { IVolunteer } from '../../common/interfaces/volunteer.interface';
import API from '../api';

export const getVolunteers = async (
  filterStatus: VolunteerStatus,
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IVolunteer>> => {
  return API.get('/volunteers', {
    params: { limit, page, filterStatus, orderBy, orderDirection },
  }).then((res) => res.data);
};

export const getVolunteer = async (id: string): Promise<IVolunteer> => {
  return API.get(`volunteers/${id}`).then((res) => res.data);
};

export const archiveVolunteer = async (id: string): Promise<IVolunteer> => {
  return API.patch(`volunteer/${id}/archive`).then((res) => res.data);
};

export const activateVolunteer = async (id: string): Promise<IVolunteer> => {
  return API.patch(`volunteer/${id}/activate`).then((res) => res.data);
};

export const blockVolunteer = async (id: string): Promise<IVolunteer> => {
  return API.patch(`volunteer/${id}/block`).then((res) => res.data);
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
  return API.patch(`volunteers/${id}/edit`, {
    ...data,
    branch: data.branch.value,
    role: data.role.value,
    department: data.department.value,
  }).then((res) => res.data);
};
