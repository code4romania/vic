import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { VolunteerFormData } from '../../pages/EditVolunteer';
import { getVolunteer, getVolunteers, updateVolunteer } from './volunteer.api';

export const useVolunteersQuery = (
  filterStatus: VolunteerStatus,
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['volunteers', filterStatus, limit, page, orderBy, orderDirection],
    () => getVolunteers(filterStatus, limit, page, orderBy, orderDirection),
    {
      enabled: !!(filterStatus && limit && page),
      onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
    },
  );
};

export const useVolunteerQuery = (id: string) => {
  return useQuery(['volunteer', id], () => getVolunteer(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

export const useUpdateVolunteerMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: VolunteerFormData }) => updateVolunteer(id, data),
    {
      onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
    },
  );
};
