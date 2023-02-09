import { AxiosError } from 'axios';
import { useQuery, useMutation } from 'react-query';
import { ORGANIZATION_ERRORS } from '../../common/errors/entities/organization.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getOrganization, getOrganizationForEdit, updateOrganization } from './organization.api';

export const useOrganizationQuery = () => {
  return useQuery(['organization'], () => getOrganization(), {
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => error,
  });
};

export const useOrganizationForEditQuery = () => {
  return useQuery(['edit_organization'], () => getOrganizationForEdit(), {
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => error,
  });
};

export const useUpdateOrganizationMutation = () => {
  return useMutation((description: string) => updateOrganization(description));
};
