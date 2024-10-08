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
import { DataSet, InitialDataSet } from '../../components/LineChart';
import { PieChartOption } from '../../common/constants/pie-chart-options';
import { LineChartOption } from '../../common/constants/line-chart-options';

export const getVolunteers = async (
  status: VolunteerStatus,
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  age?: AgeRangeEnum,
  branch?: string,
  department?: string,
  role?: string,
  city?: string,
  county?: string,
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
      branch,
      department,
      role,
      city,
      county,
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
  branch?: string,
  department?: string,
  role?: string,
  city?: string,
  county?: string,
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
      branch,
      department,
      role,
      city,
      county,
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

export const getVolunteerListItems = async (params: {
  status: VolunteerStatus;
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<{ id: string; name: string }>> => {
  return API.get('/listing/volunteers', { params }).then((res) => res.data);
};

export const getVolunteerStatistics = async (): Promise<IVolunteerStatistics> => {
  return API.get('/dashboard/volunteer-status').then((res) => res.data);
};

export const getVolunteerLineChart = async (interval: LineChartOption): Promise<DataSet[]> => {
  return API.get('/dashboard/volunteer-status-timeseries', { params: { interval } }).then((res) =>
    res.data.map((item: InitialDataSet) => ({
      ...item,
      active: Number(item.active),
      archived: Number(item.archived),
    })),
  );
};

//Volunteer Pie Chart
export const getVolunteerPieChart = async (
  group: PieChartOption,
): Promise<{ count: string; name: string }[]> => {
  return API.get('/dashboard/volunteer-grouped', { params: { group } }).then((res) => res.data);
};
