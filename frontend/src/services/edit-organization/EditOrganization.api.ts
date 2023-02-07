import API from '../api';

export const getOrganizationDescription = async (): Promise<string> => {
  return API.get(`/organization/edit`).then((res) => res.data);
};

export const updateOrganizationDescription = async (description: string): Promise<string> => {
  return API.patch(`/organization/edit`, description).then((res) => res.data);
};
