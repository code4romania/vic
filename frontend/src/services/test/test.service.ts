import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/sort-direction.enum';
import { DivisionType } from '../../components/Division';
import { getDivisionData, getTestValues } from './test.api';

export const useTestValuesQuery = () => useQuery(['test-values'], () => getTestValues());

export const useDivisionDataQuery = (
  limit: number,
  page: number,
  orderBy: string,
  orderDirection: OrderDirection,
  divisionType: DivisionType,
) => {
  return useQuery(['divisions', limit, page, orderBy, orderDirection, divisionType], () =>
    getDivisionData(limit, page, orderBy, orderDirection, divisionType),
  );
};
