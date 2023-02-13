import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteersErrors } from '../../common/errors/entities/volunteers.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { VolunteerStatus } from '../../pages/Volunteers';
import { getVolunteers } from './volunteers.api';

export const useVolunteersQuery = (
  filterStatus: VolunteerStatus,
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['registration_requests', filterStatus, limit, page, orderBy, orderDirection],
    () => getVolunteers(filterStatus, limit, page, orderBy, orderDirection),
    {
      enabled: !!(filterStatus && limit && page),
      onError: (error: AxiosError<IBusinessException<VolunteersErrors>>) => error,
    },
  );
};
