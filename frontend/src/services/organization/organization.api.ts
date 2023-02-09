import API from '../api';

import { IOrganization } from '../../components/OrganizationProfile';

export const getOrganization = async (): Promise<IOrganization> => {
  return API.get(`/organization`).then((res) => res.data);
};

export const getOrganizationForEdit = async (): Promise<IOrganization> => {
  return API.get(`/organization/edit`).then((res) => res.data);
};

export const updateOrganizationDescription = async (
  description: string,
): Promise<IOrganization> => {
  return API.patch(`/organization/edit`, description).then((res) => res.data);
};
