import { IAddContractTemplatePayload } from './documents-templates.service';
import API from '../api';

export const addContractTemplate = (data: IAddContractTemplatePayload) => {
  return API.post('/documents/templates', data).then((res) => res.data);
};

export const getContractTemplate = (id: string) => {
  return API.get(`/documents/templates/${id}`).then((res) => res.data);
};
