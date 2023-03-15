import { AxiosError } from 'axios';
import { useQuery, useMutation } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ORGANIZATION_ERRORS } from '../../common/errors/entities/organization.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { AccessCodeFormTypes } from '../../components/AccessCodeForm';
import {
  createAccessCode,
  deleteAccessCode,
  getAccessCode,
  getAccessCodes,
  getOrganization,
  updateAccessCode,
  updateOrganizationDescription,
} from './organization.api';

export const useOrganizationQuery = () => {
  return useQuery(['organization'], () => getOrganization(), {
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => error,
  });
};

export const useUpdateOrganizationDescriptionMutation = () => {
  return useMutation(
    ['organization'],
    (description: string) => updateOrganizationDescription(description),
    {
      onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useAccessCodesQuery = (
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy = 'code',
  orderDirection: OrderDirection = OrderDirection.ASC,
) => {
  return useQuery(['access-codes', limit, page, orderBy, orderDirection], () =>
    getAccessCodes(limit, page, orderBy, orderDirection),
  );
};

export const useAccessCodeQuery = (id: string) => {
  return useQuery(['access-code', id], () => getAccessCode(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => error,
  });
};

export const useCreateAccessCodesMutation = () => {
  return useMutation((accessCode: AccessCodeFormTypes) => createAccessCode(accessCode), {
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => Promise.resolve(error),
  });
};

export const useUpdateAccessCodeMutation = () => {
  return useMutation(
    ({ id, endDate }: { id: string; endDate?: Date }) => updateAccessCode(id, endDate),
    {
      onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useDeleteAccessCodeMutation = () => {
  return useMutation((id: string) => deleteAccessCode(id), {
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => Promise.resolve(error),
  });
};
