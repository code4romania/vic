import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { DivisionType } from '../../common/enums/division-type.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { DIVISION_ERRORS } from '../../common/errors/entities/division.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  addDivision,
  deleteDivision,
  getDivisions,
  editDivision,
  getDivisionsListItems,
} from './division.api';

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
      enabled: !!divisionType,
      onError: (error: AxiosError<IBusinessException<DIVISION_ERRORS>>) => error,
    },
  );
};

export const useDivisionsListItemsQuery = (divisionType: DivisionType) => {
  return useQuery(
    ['divisions-list-items', divisionType],
    () => getDivisionsListItems(divisionType),
    {
      enabled: !!divisionType,
      cacheTime: 1000000,
      onError: (error) =>
        // TODO: improve this
        console.error('Error while loading organization structure list item data', error),
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
