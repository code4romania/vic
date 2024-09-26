import { DocumentContractStatusForFilter } from '../../common/enums/document-contract-status.enum';
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
  const { data: contracts } = await API.get<IPaginatedEntity<IDocumentContract>>(
    '/documents/contracts',
    {
      params,
    },
  );

  // These enum values (ACTIVE, EXPIRED, NOT_STARTED) are not stored in the database
  // They are derived statuses based on the contract's start and end dates
  // We need to manually update the status here to reflect these derived states
  const statusesToUpdate = [
    DocumentContractStatusForFilter.ACTIVE,
    DocumentContractStatusForFilter.EXPIRED,
    DocumentContractStatusForFilter.NOT_STARTED,
  ];

  if (params.status && statusesToUpdate.includes(params.status)) {
    contracts.items = contracts.items.map((item: IDocumentContract) => ({
      ...item,
      status: params.status as DocumentContractStatusForFilter,
    }));
  }

  return contracts;
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
