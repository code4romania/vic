import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { getContract, getContracts, signContract } from './contract.api';
import { ContractStatus } from '../../common/enums/contract-status.enum';
import { DocumentResult } from 'expo-document-picker';

export const useContractsInfiniteQuery = (volunteerId: string, status: ContractStatus) => {
  return useInfiniteQuery(
    ['contracts', volunteerId, status],
    ({ pageParam }) => getContracts({ pageParam, volunteerId, status }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
      enabled: !!volunteerId && !!status,
    },
  );
};

export const useContractQuery = (contractId: string) => {
  return useQuery(['contract', contractId], () => getContract(contractId), {
    enabled: !!contractId,
  });
};

export const useSignContractMutation = () => {
  return useMutation((payload: { contractId: string; contract: DocumentResult }) =>
    signContract(payload),
  );
};
