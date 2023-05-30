import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ITemplateListItem } from '../../common/interfaces/template.interface';
// import API from '../api';

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

export const addContractTemplate = (payload: { name: string; template: object }) => {
  // return API.post('', { ...payload });
  console.log(payload);
  return Promise.resolve();
};
