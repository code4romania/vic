import {
  IAddDocumentContractDTO,
  IDocumentContract,
  IDocumentContractsStatistics,
  IGetDocumentContractResponse,
  IGetDocumentsContractsParams,
  IRejectDocumentContractBody,
  ISignDocumentContractBody,
} from '../../common/interfaces/document-contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

export const getDocumentsContracts = async (
  params: IGetDocumentsContractsParams,
): Promise<IPaginatedEntity<IDocumentContract>> => {
  return API.get<IPaginatedEntity<IDocumentContract>>('/documents/contracts', {
    params,
  }).then((res) => res.data);
};

export const getDocumentContract = (id: string): Promise<IGetDocumentContractResponse> => {
  return API.get(`/documents/contracts/${id}`).then((res) => res.data);
};

export const addDocumentContract = (data: IAddDocumentContractDTO) => {
  return API.post('/documents/contracts', data).then((res) => res.data);
};

export const signDocumentContract = (id: string, body: ISignDocumentContractBody) => {
  return API.patch(`/documents/contracts/${id}/sign`, body).then((res) => res.data);
};

export const approveDocumentContract = (id: string) => {
  return API.patch(`/documents/contracts/${id}/approve`).then((res) => res.data);
};

export const rejectDocumentContract = (id: string, body: IRejectDocumentContractBody) => {
  return API.patch(`/documents/contracts/${id}/reject`, body).then((res) => res.data);
};

export const deleteDocumentContract = (id: string) => {
  return API.delete(`/documents/contracts/${id}`).then((res) => res.data);
};

export const getContractsStatistics = async (): Promise<IDocumentContractsStatistics> => {
  return API.get('documents/contracts/statistics').then((res) => res.data);
};
