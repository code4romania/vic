import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { getAccessCodes } from './volunteer.service';

export const useGetAccessCodesQuery = (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['access-codes', limit, page, orderBy, orderDirection],
    () => getAccessCodes(limit, page, orderBy, orderDirection),
    { enabled: !!(limit && page) },
  );
};
