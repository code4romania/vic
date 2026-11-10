import API from '../api';

// "Template-uri": blank contract models the NGO keeps for download (#486: no generation, no signing)
export interface IContractModel {
  id: string;
  name: string;
  createdOn: string;
  uri: string;
}

export const getContractModels = async (): Promise<IContractModel[]> => {
  return API.get('template').then((res) => res.data);
};

export const uploadContractModel = async ({
  name,
  file,
}: {
  name: string;
  file: File;
}): Promise<IContractModel> => {
  const formData = new FormData();
  formData.append('name', name.trim());
  formData.append('template', file);
  return API.post('template', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const deleteContractModel = async (id: string): Promise<string> => {
  return API.delete(`template/${id}`).then((res) => res.data);
};
