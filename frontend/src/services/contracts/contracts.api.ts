import { format } from 'date-fns';
import {
  ContractFilterStatus,
  ContractStatus,
  EXPIRING_SOON,
} from '../../common/enums/contract-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { DocumentType } from '../../common/enums/document-type.enum';
import {
  ICertificatePrefill,
  IContract,
  IContractListItem,
  IGenerateCertificatePayload,
  IUploadContractPayload,
} from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { AxiosResponseHeaders } from 'axios';

export interface IContractsQueryParams {
  orderBy?: string;
  orderDirection?: OrderDirection;
  status?: ContractFilterStatus;
  type?: DocumentType;
  volunteerId?: string;
  search?: string;
}

export type IContractCounters = Record<ContractStatus, number> & {
  [EXPIRING_SOON]?: number;
};

// The counters on top of "Contracte și documente"
export const getContractCounters = async (): Promise<IContractCounters> => {
  return API.get('contract/counters').then((res) => res.data);
};

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
  type,
}: IUploadContractPayload): Promise<IContract> => {
  const formData = new FormData();
  formData.append('volunteerId', volunteerId);
  if (type) formData.append('type', type);
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

// #490: the certificate form opens with the volunteer's approved hours
export const getCertificatePrefill = async (volunteerId: string): Promise<ICertificatePrefill> => {
  return API.get('contract/certificate/prefill', { params: { volunteerId } }).then(
    (res) => res.data,
  );
};

// #490: the certificate as a PDF, to sign and upload back
export const generateCertificate = async ({
  issueDate,
  ...payload
}: IGenerateCertificatePayload): Promise<{ data: Blob; fileName: string }> => {
  return API.post(
    'contract/certificate',
    { ...payload, issueDate: format(issueDate, 'yyyy-MM-dd') },
    { responseType: 'blob' },
  ).then((res) => {
    const disposition = (res.headers['content-disposition'] as string | undefined) ?? '';
    const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'Adeverinta.pdf';
    return { data: res.data, fileName };
  });
};
