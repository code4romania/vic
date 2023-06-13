import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IdName } from '../../common/interfaces/id-name.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ITemplateListItem } from '../../common/interfaces/template-list-item.interface';
import { ITemplate } from '../../common/interfaces/template.interface';
import { AddContractTemplateFormTypes } from '../../pages/AddContractTemplate';
import { EditContractTemplateFormTypes } from '../../pages/EditContractTemplate';
import API from '../api';

export const createTemplate = async (payload: AddContractTemplateFormTypes): Promise<ITemplate> => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('template', payload.template);

  return API.post('template', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const editContractTemplate = async (id: string, payload: EditContractTemplateFormTypes) => {
  return API.patch(`template/${id}`, payload).then((res) => res.data);
};

export const getTemplate = async (id: string): Promise<ITemplate> => {
  return API.get(`template/${id}`).then((res) => res.data);
};

export const getTemplates = async (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<ITemplateListItem>> => {
  return API.get('template', { params }).then((res) => res.data);
};

export const getAllTemplatesForMyOrganization = async (search: string): Promise<IdName[]> => {
  return API.get('template/all', { params: { search } }).then((res) => res.data);
};

export const deleteTemplate = async (id: string): Promise<void> => {
  return API.delete(`template/${id}`).then((res) => res.data);
};
