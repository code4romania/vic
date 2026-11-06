import { AxiosError } from 'axios';
import { useQuery, useMutation } from 'react-query';
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
  registerOrganization,
  updateAccessCode,
  updateOrganization,
} from './organization.api';
import {
  IOrganizationFields,
  IOrganizationFiles,
  IRegisterOrganization,
} from '../../common/interfaces/organization.interface';

export const useOrganizationQuery = () => {
  return useQuery(['organization'], () => getOrganization(), {
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => error,
  });
};

export type OrganizationApiError = AxiosError<IBusinessException<ORGANIZATION_ERRORS>>;

export const useUpdateOrganizationMutation = () => {
  return useMutation(
    ['organization'],
    ({ data, files }: { data: IOrganizationFields; files?: IOrganizationFiles }) =>
      updateOrganization(data, files),
    { onError: (error: OrganizationApiError) => Promise.resolve(error) },
  );
};

export const useRegisterOrganizationMutation = () => {
  return useMutation(
    ({ data, files }: { data: IRegisterOrganization; files: IOrganizationFiles }) =>
      registerOrganization(data, files),
    { onError: (error: OrganizationApiError) => Promise.resolve(error) },
  );
};

export const useAccessCodesQuery = (
  limit: number,
  page: number,
  orderBy: string,
  orderDirection: OrderDirection,
) => {
  return useQuery(
    ['access-codes', limit, page, orderBy, orderDirection],
    () => getAccessCodes(limit, page, orderBy, orderDirection),
    {
      enabled: !!(limit && page),
    },
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
    ({ id, endDate }: { id: string; endDate?: Date | null }) => updateAccessCode(id, endDate),
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
