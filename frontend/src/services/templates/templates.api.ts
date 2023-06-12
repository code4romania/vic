import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ITemplateListItem } from '../../common/interfaces/template-list-item.interface';
import { ITemplate } from '../../common/interfaces/template.interface';
import { AddContractTemplateFormTypes } from '../../pages/AddContractTemplate';
import API from '../api';

export const createTemplate = async (payload: AddContractTemplateFormTypes): Promise<ITemplate> => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('template', payload.template);

  return API.post('template', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const getTemplate = async (id: string): Promise<ITemplate> => {
  return API.get(`template/${id}`).then((res) => res.data);
};

export const getTemplates = (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<ITemplateListItem>> => {
  return API.get('template', { params }).then((res) => res.data);
};

export const deleteTemplate = (id: string): Promise<void> => {
  // return API.delete(`/documents/templates/${id}`).then((res) => res.data);
  console.log(id);
  return Promise.resolve();
};

export const editContractTemplate = (id: string, payload: { name: string }) => {
  // return API.patch('', { ...payload }).then((res) => res.data);
  console.log(id, payload);
  return Promise.resolve();
};
