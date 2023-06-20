import { ContractStatus } from '../../common/enums/contract-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';
import { IContract } from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  volunteerId: string;
  status: ContractStatus;
}

export const getContracts = async ({
  pageParam = 1,
  volunteerId,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IContractListItem>> => {
  return API.get('/mobile/contract', {
    params: {
      limit: 25,
      page: pageParam,
      orderDirection: OrderDirection.ASC,
      volunteerId,
      ...params,
    },
  }).then((res) => res.data);
};

export const getContract = async (contractId: string): Promise<IContract> => {
  return API.get(`/mobile/contract/${contractId}`).then((res) => res.data);
};
