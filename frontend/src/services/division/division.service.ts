import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { DISVISION_ERRORS } from '../../common/errors/entities/division.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { DivisionType } from '../../components/Divisions';
import { deleteDivision, getDivisions } from './division.api';

export const useDivisionsQuery = (
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  divisionType: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['divisions', limit, page, divisionType, orderBy, orderDirection],
    () => getDivisions(limit, page, divisionType, orderBy, orderDirection),
    {
      enabled: !!(limit && page && divisionType),
      onError: (error: AxiosError<IBusinessException<DISVISION_ERRORS>>) => error,
    },
  );
};

export const useDeleteDivisionMutation = () => {
  return useMutation((id: string) => deleteDivision(id));
};
