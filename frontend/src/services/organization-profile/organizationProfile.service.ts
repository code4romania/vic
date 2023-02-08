import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { ORGANIZATION_ERRORS } from '../../common/errors/entities/organization.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getOrganizationProfile } from './organizationProfile.api';

export const useOrganizationProfileQuery = () => {
  return useQuery(['organization_profile'], () => getOrganizationProfile(), {
    onError: (error: AxiosError<IBusinessException<ORGANIZATION_ERRORS>>) => error,
  });
};
