import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { DivisionType } from '../../components/Divisions';
import { getDivisionData } from './division.api';

export const useDivisionDataQuery = (
  limit: number,
  page: number,
  divisionType: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['divisions', limit, page, divisionType, orderBy, orderDirection],
    () => getDivisionData(limit, page, divisionType, orderBy, orderDirection),
    {
      enabled: !!(limit && page && divisionType),
    },
  );
};
