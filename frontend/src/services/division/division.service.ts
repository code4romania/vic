import { useMutation, useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { DivisionType } from '../../components/Divisions';
import { deleteDivision, getDivisions } from './division.api';

export const useDivisionsQuery = (
  limit: number,
  page: number,
  divisionType: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['divisions', limit, page, divisionType, orderBy, orderDirection],
    () => getDivisions(limit, page, divisionType, orderBy, orderDirection),
    {
      enabled: !!(limit && page && divisionType),
    },
  );
};

export const useDeleteDivisionMutation = () => {
  return useMutation((id: string) => deleteDivision(id));
};
