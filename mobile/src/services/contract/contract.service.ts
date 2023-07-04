import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import {
  cancelContract,
  getContract,
  getContractsHistory,
  getPendingContracts,
  signContract,
} from './contract.api';
import { DocumentResult } from 'expo-document-picker';

export const useContractHistoryInfiniteQuery = (volunteerId: string) => {
  return useInfiniteQuery(
    ['contract-history', volunteerId],
    ({ pageParam }) => getContractsHistory({ pageParam, volunteerId }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
      enabled: !!volunteerId,
    },
  );
};

export const usePendingContractsInfiniteQuery = (volunteerId: string) => {
  return useInfiniteQuery(
    ['contracts-pending', volunteerId],
    ({ pageParam }) => getPendingContracts({ pageParam, volunteerId }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
      enabled: !!volunteerId,
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

export const useCancelContractMutation = () => {
  return useMutation((payload: { contractId: string }) => cancelContract(payload));
};
