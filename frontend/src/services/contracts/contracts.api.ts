import { format } from 'date-fns';
import { ContractStatus } from '../../common/enums/contract-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import {
  IContract,
  IContractListItem,
  IUploadContractPayload,
} from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { AxiosResponseHeaders } from 'axios';

export interface IContractsQueryParams {
  orderBy?: string;
  orderDirection?: OrderDirection;
  status?: ContractStatus;
  volunteerId?: string;
}

export const getContracts = async (
  params: IContractsQueryParams & { page: number; limit: number },
): Promise<IPaginatedEntity<IContractListItem>> => {
  return API.get('contract', { params }).then((res) => res.data);
};

export const getContractsForDownload = async (
  params: IContractsQueryParams,
): Promise<{ data: unknown; headers: AxiosResponseHeaders }> => {
  return API.get('contract/download', {
    params,
    responseType: 'arraybuffer',
  }).then((res) => {
    return { data: res.data, headers: res.headers as AxiosResponseHeaders };
  });
};

export const getPendingContractsCount = async (): Promise<number> => {
  return API.get('contract/active').then((res) => res.data);
};

// #486: the NGO uploads a contract already signed, with its period (dates sent as calendar days)
export const uploadContract = async ({
  contract,
  startDate,
  endDate,
  volunteerId,
  contractNumber,
}: IUploadContractPayload): Promise<IContract> => {
  const formData = new FormData();
  formData.append('volunteerId', volunteerId);
  formData.append('startDate', format(startDate, 'yyyy-MM-dd'));
  if (endDate) formData.append('endDate', format(endDate, 'yyyy-MM-dd'));
  if (contractNumber?.trim()) formData.append('contractNumber', contractNumber.trim());
  formData.append('contract', contract);
  return API.post('contract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const deleteContract = async (id: string): Promise<void> => {
  return API.delete(`contract/${id}`).then((res) => res.data);
};
