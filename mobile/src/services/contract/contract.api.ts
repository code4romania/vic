import { DocumentResult } from 'expo-document-picker';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';
import { IContract } from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

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
      limit: 25,
      page: pageParam,
      orderDirection: OrderDirection.ASC,
      volunteerId,
      ...params,
    },
  }).then((res) => res.data);
};

export const getPendingContracts = async ({
  pageParam = 1,
  volunteerId,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IContractListItem>> => {
  return API.get('/mobile/contract/pending', {
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

export const signContract = async ({
  contractId,
  contract,
}: {
  contractId: string;
  contract: DocumentResult;
}): Promise<IContract> => {
  const formData = new FormData();

  formData.append('contract', contract as File);

  return API.patch(`mobile/contract/${contractId}/sign`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const cancelContract = async ({
  contractId,
}: {
  contractId: string;
}): Promise<IContract> => {
  return API.patch(`mobile/contract/${contractId}/cancel`).then((res) => res.data);
};
