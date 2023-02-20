import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getVolunteers } from './volunteer.api';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../pages/Volunteers';

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
