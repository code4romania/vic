import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  IVolunteersFilters,
  activateVolunteer,
  addVolunteer,
  importVolunteers,
  archiveVolunteer,
  deleteVolunteer,
  updateVolunteerDetails,
  blockVolunteer,
  getVolunteer,
  getVolunteerEvents,
  getVolunteerStats,
  getVolunteerLineChart,
  getVolunteerPieChart,
  getVolunteers,
  getVolunteerStatistics,
  updateVolunteer,
} from './volunteer.api';
import { VolunteerFormTypes } from '../../pages/EditVolunteer';
import { AddVolunteerFormTypes } from '../../pages/AddVolunteer';
import { LineChartOption } from '../../common/constants/line-chart-options';
import { PieChartOption } from '../../common/constants/pie-chart-options';

export const useVolunteersQuery = (
  filters: IVolunteersFilters & { limit: number; page: number },
) => {
  return useQuery(['volunteers', filters], () => getVolunteers(filters), {
    enabled: !!(filters.limit && filters.page),
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

export const useVolunteer = (id: string) => {
  return useQuery(['volunteer', id], () => getVolunteer(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

export const useVolunteerStatsQuery = (id: string) => {
  return useQuery(['volunteer-stats', id], () => getVolunteerStats(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

export const useVolunteerEventsQuery = (id: string) => {
  return useQuery(['volunteer-events', id], () => getVolunteerEvents(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

export const useAddVolunteerMutation = () => {
  return useMutation((data: AddVolunteerFormTypes) => addVolunteer(data), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
  });
};

export const useImportVolunteersMutation = () => {
  return useMutation((file: File) => importVolunteers(file), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
  });
};

export const useUpdateVolunteerDetailsMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: { source?: string | null; isFavorite?: boolean } }) =>
      updateVolunteerDetails(id, data),
    {
      onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
    },
  );
};

export const useDeleteVolunteerMutation = () => {
  return useMutation((id: string) => deleteVolunteer(id), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
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
    enabled: !!filter,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

//Volunteer Pie Chart
export const useVolunteerPieChartQuery = (filter: PieChartOption) => {
  return useQuery(['volunteer-pie-chart', filter], () => getVolunteerPieChart(filter), {
    enabled: !!filter,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};
