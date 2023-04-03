import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { AgeRangeEnum } from '../../common/enums/age-range.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  activateVolunteer,
  archiveVolunteer,
  blockVolunteer,
  getVolunteer,
  getVolunteerLineChart,
  getVolunteerPieChart,
  getVolunteers,
  getVolunteerStatistics,
  updateVolunteer,
} from './volunteer.api';
import { VolunteerFormTypes } from '../../pages/EditVolunteer';
import { LineChartOption } from '../../common/constants/line-chart-options';
import { PieChartOption } from '../../common/constants/pie-chart-options';

export const useVolunteersQuery = (
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
) => {
  return useQuery(
    [
      'volunteers',
      status,
      limit,
      page,
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
    ],
    () =>
      getVolunteers(
        status,
        limit,
        page,
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
      ),
    {
      enabled: !!(status && limit && page),
      onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
    },
  );
};

export const useVolunteer = (id: string) => {
  return useQuery(['volunteer', id], () => getVolunteer(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

export const useArchiveVolunteerMutation = () => {
  return useMutation((id: string) => archiveVolunteer(id), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
  });
};

export const useActivateVolunteerMutation = () => {
  return useMutation((id: string) => activateVolunteer(id), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
  });
};

export const useBlockVolunteerMutation = () => {
  return useMutation((id: string) => blockVolunteer(id), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
  });
};

export const useUpdateVolunteerMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: VolunteerFormTypes }) => updateVolunteer(id, data),
    {
      onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
    },
  );
};

//Volunteer Statistics
export const useVolunteerStatisticsQuery = () => {
  return useQuery(['volunteer-statistics'], () => getVolunteerStatistics(), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

//Volunteer Line Chart
export const useVolunteerLineChartQuery = (filter: LineChartOption) => {
  return useQuery(['volunteer-line-chart', filter], () => getVolunteerLineChart(filter), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

//Volunteer Pie Chart
export const useVolunteerPieChartQuery = (filter: PieChartOption) => {
  return useQuery(['volunteer-pie-chart', filter], () => getVolunteerPieChart(filter), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};
