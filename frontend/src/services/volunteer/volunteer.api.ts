import { IImportVolunteersResult } from '../../common/interfaces/volunteer.interface';
import { format } from 'date-fns';
import { AddVolunteerFormTypes } from '../../pages/AddVolunteer';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { VolunteerFormTypes } from '../../pages/EditVolunteer';
import { IVolunteer } from '../../common/interfaces/volunteer.interface';
import API from '../api';
import { AxiosResponseHeaders } from 'axios';
import { IVolunteerStatistics } from '../../common/interfaces/volunteer-statistics.interface';
import { DataSet, InitialDataSet } from '../../components/LineChart';
import { PieChartOption } from '../../common/constants/pie-chart-options';
import { LineChartOption } from '../../common/constants/line-chart-options';

// The volunteers list (#476): every status unless one is given.
export interface IVolunteersFilters {
  status?: VolunteerStatus;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
  branch?: string;
  department?: string;
  role?: string;
  activityTypeId?: string;
}

const filterParams = (filters: IVolunteersFilters) => ({
  status: filters.status,
  orderBy: filters.orderBy,
  orderDirection: filters.orderDirection,
  search: filters.search,
  branch: filters.branch,
  department: filters.department,
  role: filters.role,
  activityTypeId: filters.activityTypeId,
});

export const getVolunteers = async (
  filters: IVolunteersFilters & { limit: number; page: number },
): Promise<IPaginatedEntity<IVolunteer>> => {
  return API.get('/volunteer', {
    params: { limit: filters.limit, page: filters.page, ...filterParams(filters) },
  }).then((res) => res.data);
};

export const getVolunteersForDownload = async (
  filters: IVolunteersFilters,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  return API.get('volunteer/download', {
    params: filterParams(filters),
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

// #471: the single "add volunteer" form.
export const addVolunteer = async (data: AddVolunteerFormTypes): Promise<IVolunteer> => {
  const { city, department, birthday, phone, notes, ...rest } = data;
  return API.post('volunteer', {
    ...rest,
    ...(phone?.trim() ? { phone: phone.trim() } : {}),
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
    ...(birthday ? { birthday: format(birthday, 'yyyy-MM-dd') } : {}),
    ...(city ? { locationId: Number(city.value) } : {}),
    ...(department ? { departmentId: department.key } : {}),
  }).then((res) => res.data);
};

// #473: CSV or Excel import; every valid row becomes a Candidate.
export const importVolunteers = async (file: File): Promise<IImportVolunteersResult> => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('volunteer/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const updateVolunteerDetails = async (
  id: string,
  data: { source?: string | null; notes?: string | null; isFavorite?: boolean },
): Promise<IVolunteer> => {
  return API.patch(`volunteer/${id}/details`, data).then((res) => res.data);
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
