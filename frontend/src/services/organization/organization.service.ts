import { AxiosError } from 'axios';
import { useQuery, useMutation } from 'react-query';
import { ORGANIZATION_ERRORS } from '../../common/errors/entities/organization.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getOrganization, updateOrganizationDescription } from './organization.api';

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
