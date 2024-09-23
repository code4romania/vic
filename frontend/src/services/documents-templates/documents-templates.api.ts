import { IAddContractTemplatePayload } from './documents-templates.service';
import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import {
  IDocumentTemplate,
  IDocumentTemplateListItem,
} from '../../common/interfaces/template.interface';

export const getTemplates = async (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
}): Promise<IPaginatedEntity<IDocumentTemplateListItem>> => {
  return API.get('documents/templates', { params }).then((res) => res.data);
};

export const getTemplateById = async (id?: string): Promise<IDocumentTemplate> => {
  return API.get(`/documents/templates/${id}`).then((res) => res.data);
};

export const addContractTemplate = (data: IAddContractTemplatePayload) => {
  return API.post('/documents/templates', data).then((res) => res.data);
};

export const getContractTemplate = (id: string) => {
  return API.get(`/documents/templates/${id}`).then((res) => res.data);
};
