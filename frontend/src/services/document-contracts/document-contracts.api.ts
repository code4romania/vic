import {
  IAddDocumentContractDTO,
  IGetDocumentContractResponse,
  IGetDocumentsContractsParams,
  IRejectDocumentContractBody,
  ISignDocumentContractBody,
} from '../../common/interfaces/document-contract.interface';
import API from '../api';

export const getDocumentsContracts = (params: IGetDocumentsContractsParams) => {
  return API.get('/documents/contracts', { params }).then((res) => res.data);
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

export const rejectDocumentContract = (id: string, body: IRejectDocumentContractBody) => {
  return API.patch(`/documents/contracts/${id}/reject`, body).then((res) => res.data);
};