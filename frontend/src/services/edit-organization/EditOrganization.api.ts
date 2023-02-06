import API from '../api';

export const getOrganizationDescription = async (id: string): Promise<string> => {
  return API.get(`/organization/${id}`).then((res) => res.data);
};

export const updateOrganizationDescription = async (
  description: string,
  id: string,
): Promise<void> => {
  return API.patch(`/organization/${id}`, description).then((res) => res.data);
};
