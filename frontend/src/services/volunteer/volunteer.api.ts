import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { VolunteerFormTypes } from '../../pages/EditVolunteer';
import { IVolunteer } from '../../common/interfaces/volunteer.interface';
import API from '../api';
import { AgeRangeEnum } from '../../common/enums/age-range.enum';
import { AxiosResponseHeaders } from 'axios';
import { formatEndDateISO9075, formatStartDateISO9075 } from '../../common/utils/utils';
import { IVolunteerStatistics } from '../../common/interfaces/volunteer-statistics.interface';
import { DataSet } from '../../components/LineChart';

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
  activeSinceStart?: Date,
  activeSinceEnd?: Date,
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
      ...(activeSinceStart ? { activeSinceStart: formatStartDateISO9075(activeSinceStart) } : {}),
      ...(activeSinceEnd ? { activeSinceEnd: formatEndDateISO9075(activeSinceEnd) } : {}),
    },
  }).then((res) => res.data);
};

export const getVolunteersForDownload = async (
  status: VolunteerStatus,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  age?: AgeRangeEnum,
  branchId?: string,
  departmentId?: string,
  roleId?: string,
  locationId?: string,
  activeSinceStart?: Date,
  activeSinceEnd?: Date,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  return API.get('volunteer/download', {
    params: {
      status,
      orderBy,
      orderDirection,
      search,
      age,
      branchId,
      departmentId,
      roleId,
      locationId,
      ...(activeSinceStart ? { activeSinceStart: formatStartDateISO9075(activeSinceStart) } : {}),
      ...(activeSinceEnd ? { activeSinceEnd: formatEndDateISO9075(activeSinceEnd) } : {}),
    },
    responseType: 'arraybuffer',
  }).then((res) => {
    return { data: res.data, headers: res.headers as AxiosResponseHeaders };
  });
};

export const getVolunteer = async (id: string): Promise<IVolunteer> => {
  return API.get(`volunteer/${id}`).then((res) => res.data);
};

export const updateVolunteer = async (
  id: string,
  data: VolunteerFormTypes,
): Promise<IVolunteer> => {
  return API.patch(`volunteer/${id}`, {
    ...data,
    branchId: data.branch?.key,
    roleId: data.role?.key,
    departmentId: data.department?.key,
  }).then((res) => res.data);
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

//Volunteer Statistics
export const getVolunteerStatistics = async (): Promise<IVolunteerStatistics> => {
  // return API.get('to be determined').then((res) => res.data);
  return Promise.resolve({ volunteers: '97573', requests: '820' });
};

//Volunteer Line Chart
export const getVolunteerLineChart = async (filter: string): Promise<DataSet[]> => {
  // return API.get('to be determined', {params: {filter}}).then((res) => res.data);
  console.log(filter);
  return filter === 'monthly'
    ? Promise.resolve([
        { name: 'JAN', active: 1821, archived: 131 },
        { name: 'FEB', active: 4121, archived: 331 },
        { name: 'MAR', active: 1321, archived: 31 },
        { name: 'APR', active: 121, archived: 731 },
        { name: 'MAY', active: 2721, archived: 231 },
        { name: 'JUN', active: 1921, archived: 431 },
        { name: 'JUL', active: 3421, archived: 731 },
        { name: 'AUG', active: 1621, archived: 231 },
        { name: 'SEP', active: 5521, archived: 531 },
        { name: 'OCT', active: 3121, archived: 131 },
        { name: 'NOV', active: 2421, archived: 431 },
        { name: 'DEC', active: 1821, archived: 831 },
      ])
    : filter === 'yearly'
    ? Promise.resolve([
        { name: '2012', active: 1231, archived: 121 },
        { name: '2013', active: 1731, archived: 321 },
        { name: '2014', active: 2031, archived: 421 },
        { name: '2015', active: 2831, archived: 521 },
        { name: '2016', active: 4131, archived: 621 },
        { name: '2017', active: 5231, archived: 721 },
        { name: '2018', active: 6431, archived: 821 },
        { name: '2019', active: 7831, archived: 921 },
        { name: '2020', active: 9831, archived: 1021 },
        { name: '2021', active: 11331, archived: 1121 },
      ])
    : Promise.resolve([
        { name: '01 Jan', active: 1231, archived: 112 },
        { name: '02 Jan', active: 1432, archived: 132 },
        { name: '03 Jan', active: 1543, archived: 143 },
        { name: '04 Jan', active: 1765, archived: 165 },
        { name: '05 Jan', active: 1987, archived: 187 },
        { name: '06 Jan', active: 2010, archived: 210 },
        { name: '07 Jan', active: 2232, archived: 232 },
        { name: '08 Jan', active: 2443, archived: 243 },
        { name: '09 Jan', active: 2654, archived: 264 },
        { name: '10 Jan', active: 2876, archived: 276 },
        { name: '11 Jan', active: 3087, archived: 297 },
        { name: '12 Jan', active: 3309, archived: 309 },
        { name: '13 Jan', active: 3521, archived: 321 },
        { name: '14 Jan', active: 3732, archived: 342 },
        { name: '15 Jan', active: 3943, archived: 363 },
        { name: '16 Jan', active: 4165, archived: 385 },
        { name: '17 Jan', active: 4387, archived: 407 },
        { name: '18 Jan', active: 4598, archived: 428 },
        { name: '19 Jan', active: 4810, archived: 450 },
        { name: '20 Jan', active: 5032, archived: 472 },
        { name: '21 Jan', active: 5243, archived: 493 },
        { name: '22 Jan', active: 5465, archived: 515 },
        { name: '23 Jan', active: 5676, archived: 536 },
        { name: '24 Jan', active: 5898, archived: 558 },
        { name: '25 Jan', active: 6110, archived: 580 },
        { name: '26 Jan', active: 6321, archived: 601 },
        { name: '27 Jan', active: 6543, archived: 623 },
        { name: '28 Jan', active: 6765, archived: 645 },
        { name: '29 Jan', active: 6976, archived: 666 },
        { name: '30 Jan', active: 7198, archived: 688 },
      ]);
};
