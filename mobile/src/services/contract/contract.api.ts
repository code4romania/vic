import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

export const CONTRACTS_PAGE_SIZE = 15;

interface PaginationQuery {
  pageParam?: number;
  volunteerId: string;
}

export const getContractsHistory = async ({
  pageParam = 1,
  volunteerId,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IContractListItem>> => {
  return API.get('/mobile/contract/history', {
    params: {
      limit: CONTRACTS_PAGE_SIZE,
      page: pageParam,
      orderDirection: OrderDirection.DESC,
      volunteerId,
      ...params,
    },
  }).then((res) => res.data);
};
