import { useMutation, useQuery } from 'react-query';
import {
  addDocumentContract,
  getDocumentContract,
  getDocumentsContracts,
  signDocumentContract,
} from './document-contracts.api';
import {
  IAddDocumentContractDTO,
  IGetDocumentsContractsParams,
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
  startDate,
  endDate,
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
      startDate,
      endDate,
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
        startDate,
        endDate,
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
        console.log(`⛔️ ERROR IN SIGN DOCUMENT CONTRACT`, error);
      },
    },
  );
};
