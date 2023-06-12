import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ITemplateListItem } from '../../common/interfaces/template.interface';
import { AddContractTemplateFormTypes } from '../../pages/AddContractTemplate';
import API from '../api';

export const createTemplate = async (payload: AddContractTemplateFormTypes) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('template', payload.template);

  return API.post('template', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const getTemplate = (id: string): Promise<ITemplateListItem> => {
  console.log(id);
  // return API.get('').then((res) => res.data);
  return Promise.resolve({ id: '123123', name: 'Name for template', uses: 1311 });
};

export const getTemplates = (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<ITemplateListItem>> => {
  // return API.get('', { params }).then((res) => res.data);
  return Promise.resolve({
    items: [
      { id: '1', name: 'Template 1', uses: 5 },
      { id: '2', name: 'Template 2', uses: 10 },
      { id: '3', name: 'Template 3', uses: 3 },
      // Add more objects as needed
    ],
    meta: {
      currentPage: params.page,
      itemCount: 3,
      itemsPerPage: params.limit,
      totalItems: 3,
      totalPages: 1,
      orderByColumn: 'name',
      orderDirection: OrderDirection.ASC,
    },
  });
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
