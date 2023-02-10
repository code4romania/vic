import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ACEESS_CODE_ERRORS } from '../../common/errors/entities/access-request.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getRegistrationRequests } from './registration-requests.api';

export const useRegistrationRequestsQuery = (
  filterStatus: string,
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['registration_requests', filterStatus, limit, page, orderBy, orderDirection],
    () => getRegistrationRequests(filterStatus, limit, page, orderBy, orderDirection),
    {
      enabled: !!(filterStatus && limit && page),
      onError: (error: AxiosError<IBusinessException<ACEESS_CODE_ERRORS>>) => error,
    },
  );
};
