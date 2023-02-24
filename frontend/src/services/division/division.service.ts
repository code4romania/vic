import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { DivisionType } from '../../common/enums/division-type.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { DIVISION_ERRORS } from '../../common/errors/entities/division.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { addDivision, deleteDivision, getDivisions, editDivision } from './division.api';

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
      onError: (error: AxiosError<IBusinessException<DIVISION_ERRORS>>) => error,
    },
  );
};

export const useAddDivisionMutation = () => {
  return useMutation(
    ({ name, type }: { name: string; type: DivisionType }) => addDivision(name, type),
    {
      onError: (error: AxiosError<IBusinessException<DIVISION_ERRORS>>) => Promise.resolve(error),
    },
  );
};

export const useEditDivisionMutation = () => {
  return useMutation(({ id, name }: { id: string; name: string }) => editDivision(id, name), {
    onError: (error: AxiosError<IBusinessException<DIVISION_ERRORS>>) => Promise.resolve(error),
  });
};

export const useDeleteDivisionMutation = () => {
  return useMutation((id: string) => deleteDivision(id), {
    onError: (error: AxiosError<IBusinessException<DIVISION_ERRORS>>) => Promise.resolve(error),
  });
};
