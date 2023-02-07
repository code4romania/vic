import API from '../api';

import { IOrganization } from '../../components/OrganizationProfile';

export const getOrganizationProfile = async (): Promise<IOrganization> => {
  return API.get(`/organization`).then((res) => res.data);
};
