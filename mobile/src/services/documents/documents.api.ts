import { DocumentContractStatus } from '../../common/enums/document-contract-status.enum';
import API from '../api';

export interface IDocumentContract {
  documentFilePath: string | null;
  documentId: string;
  documentNumber: string;
  documentStartDate: string;
  documentEndDate: string;
  organizationId: string;
  organizationName: string;
  status: DocumentContractStatus;
  volunteerId: string;
  volunteerName: string;
  rejectedByName: string;
  rejectionDate: string;
  rejectionReason: string;
}

export interface ISignContractPayload {
  organizationId: string | null;
  volunteerSignatureBase64: string | null;
  legalGuardianSignatureBase64: string | null;
}

export interface IGetContractsForVolunteerParams {
  limit?: number;
  page?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  organizationId?: string;
}

export const getContract = (
  contractId: string,
  organizationId: string,
): Promise<IDocumentContract> => {
  const params = { contractId, organizationId };
  return API.get(`/mobile/documents/contracts/${contractId}`, {
    params,
  }).then((res) => res.data);
};

export const getContractsForVolunteer = ({
  limit = 100,
  page,
  search,
  orderBy,
  orderDirection,
  organizationId,
}: IGetContractsForVolunteerParams) => {
  const params = {
    ...(limit && { limit: limit.toString() }),
    ...(page && { page: page.toString() }),
    ...(search && { search }),
    ...(orderBy && { orderBy }),
    ...(orderDirection && { orderDirection }),
    ...(organizationId && { organizationId }),
  };

  return API.get('/mobile/documents/contracts', { params }).then((res) => res.data);
};

export const signContract = ({
  contractId,
  payload,
}: {
  contractId: string | undefined;
  payload: ISignContractPayload;
}) => {
  return API.patch(`/mobile/documents/contracts/${contractId}/sign`, payload).then(
    (res) => res.data,
  );
};

export enum RejectionReason {
  INCORRECT_IDENTITY_DATA = 'incorrect_identity_data',
  DONT_AGREE_WITH_CLAUSES = 'dont_agree_with_clauses',
  WRONG_CONTRACT_PERIOD = 'wrong_contract_period',
  OTHER = 'other',
}

export interface IRejectContractPayload {
  contractId: string;
  organizationId: string | undefined;
  reason: RejectionReason;
}

export const rejectContract = ({ contractId, organizationId, reason }: IRejectContractPayload) => {
  const body = { organizationId, reason };
  return API.patch(`/mobile/documents/contracts/${contractId}/reject`, body).then(
    (res) => res.data,
  );
};
