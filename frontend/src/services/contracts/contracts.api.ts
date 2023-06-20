import { ContractStatus } from '../../common/enums/contract-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IContract, IContractListItem } from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAddContractPayload } from './contracts.service';
import API from '../api';

export const addContract = async (data: IAddContractPayload): Promise<void> => {
  return API.post('contract', data).then((res) => res.data);
};

export const getContracts = async (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
  volunteerName?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ContractStatus;
}): Promise<IPaginatedEntity<IContractListItem>> => {
  return API.get('contract', { params }).then((res) => res.data);
};

export const getActiveCountractsCount = async (): Promise<number> => {
  return API.get('contract/active').then((res) => res.data);
};

export const getContract = async (contractId: string): Promise<IContract> => {
  return API.get(`contract/${contractId}`).then((res) => res.data);
};

export const approveContract = async (id: string, contract: File): Promise<IContract> => {
  const formData = new FormData();
  formData.append('contract', contract);
  return API.patch(`contract/${id}/confirm`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const rejectContract = async (id: string, rejectionReason?: string): Promise<IContract> => {
  return API.patch(`contract/${id}/reject`, { rejectionReason }).then((res) => res.data);
};

export const deleteContract = (id: string): Promise<void> => {
  // return API.delete(`/documents/contracts/${id}`).then((res) => res.data);
  console.log(id);
  return Promise.resolve();
};
