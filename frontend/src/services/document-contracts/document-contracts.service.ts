import { useMutation, useQuery } from 'react-query';
import {
  addDocumentContract,
  approveDocumentContract,
  deleteDocumentContract,
  getContractsStatistics,
  getDocumentContract,
  getDocumentsContracts,
  rejectDocumentContract,
  signDocumentContract,
} from './document-contracts.api';
import {
  IAddDocumentContractDTO,
  IGetDocumentsContractsParams,
  IRejectDocumentContractBody,
  ISignDocumentContractBody,
} from '../../common/interfaces/document-contract.interface';

export const useGetDocumentsContractsQuery = ({
  page,
  limit,
  search,
  orderBy,
  orderDirection,
  volunteerId,
  status,
  documentStartDate,
  documentEndDate,
}: IGetDocumentsContractsParams) => {
  return useQuery({
    queryKey: [
      'documents-contracts',
      page,
      limit,
      search,
      orderBy,
      orderDirection,
      volunteerId,
      status,
      documentStartDate,
      documentEndDate,
    ],
    queryFn: () =>
      getDocumentsContracts({
        page,
        limit,
        search,
        orderBy,
        orderDirection,
        volunteerId,
        status,
        documentStartDate,
        documentEndDate,
      }),
    onError: (error) => {
      console.log('⛔️ ERROR IN GET ALL DOCUMENT CONTRACTS ⛔️', error);
    },
  });
};

export const useGetDocumentContractQuery = (id: string) => {
  return useQuery({
    queryKey: ['document-contract', id],
    enabled: !!id,
    queryFn: () => getDocumentContract(id),
    onError: (error) => {
      console.log(`⛔️ ERROR IN GET DOCUMENT CONTRACT WITH ID: ${id}⛔️`, error);
    },
  });
};

export const useAddDocumentContractMutation = () => {
  return useMutation((payload: IAddDocumentContractDTO) => addDocumentContract(payload), {
    onError: (error) => Promise.resolve(error),
  });
};

export const useSignDocumentContractMutation = () => {
  return useMutation(
    ({ id, payload }: { id: string; payload: ISignDocumentContractBody }) =>
      signDocumentContract(id, payload),
    {
      onError: (error) => {
        console.log(`⛔️ ERROR IN SIGN DOCUMENT CONTRACT ⛔️`, error);
      },
    },
  );
};

export const useApproveDocumentContractMutation = () => {
  return useMutation((id: string) => approveDocumentContract(id), {
    onError: (error) => {
      console.log(`⛔️ ERROR IN APPROVE DOCUMENT CONTRACT ⛔️`, error);
    },
  });
};

export const useRejectcontractMutation = () => {
  return useMutation(
    ({ id, payload }: { id: string; payload: IRejectDocumentContractBody }) =>
      rejectDocumentContract(id, payload),
    {
      onError: (error) => {
        console.log(`⛔️ ERROR IN REJECT DOCUMENT CONTRACT ⛔️`, error);
      },
    },
  );
};

export const useDeleteDocumentContractMutation = () => {
  return useMutation((id: string) => deleteDocumentContract(id), {
    onError: (error) => {
      console.log(`⛔️ ERROR IN DELETE DOCUMENT CONTRACT ⛔️`, error);
    },
  });
};

export const useGetContractsStatisticsQuery = () => {
  return useQuery({
    queryKey: ['contracts-statistics'],
    queryFn: () => getContractsStatistics(),
  });
};
