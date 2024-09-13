import { DocumentContractStatus } from '../../common/enums/document-contract-status.enum';
import API from '../api';

export interface DocumentContract {
  documentEndDate: string;
  documentFilePath: string | null;
  documentId: string;
  documentNumber: string;
  documentStartDate: string;
  organizationId: string;
  organizationName: string;
  status: DocumentContractStatus;
  volunteerId: string;
  volunteerName: string;
}

export interface ISignContractPayload {
  organizationId: string;
  volunteerSignatureBase64: string;
  legalGuardianSignatureBase64: string | null;
}

export const signContract = ({
  contractId,
  payload,
}: {
  contractId: string;
  payload: ISignContractPayload;
}) => {
  return API.patch(`/mobile/documents/contracts/${contractId}/sign`, payload).then(
    (res) => res.data,
  );
};

export interface IGetContractsForVolunteerParams {
  limit?: number;
  page?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  organizationId?: string;
}

export const getContractsForVolunteer = ({
  limit,
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
