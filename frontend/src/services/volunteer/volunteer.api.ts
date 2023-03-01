import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { VolunteerFormTypes } from '../../pages/EditVolunteer';
import { IVolunteer } from '../../common/interfaces/volunteer.interface';
import API from '../api';
import { AgeRangeEnum } from '../../common/enums/age-range.enum';

export const getVolunteers = async (
  status: VolunteerStatus,
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
  return API.get('/volunteer', {
    params: {
      limit,
      page,
      status,
      orderBy,
      orderDirection,
      search,
      age,
      branchId,
      departmentId,
      roleId,
      locationId,
      start,
      end,
    },
  }).then((res) => res.data);
};

export const getVolunteer = async (id: string): Promise<IVolunteer> => {
  return API.get(`volunteer/${id}`).then((res) => res.data);
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
  return API.patch(`volunteer/${id}`, {
    ...data,
    branch: data.branch.value,
    role: data.role.value,
    department: data.department.value,
  }).then((res) => res.data);
};
