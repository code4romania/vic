import { useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
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
  );
};
