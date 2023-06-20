import { useInfiniteQuery, useQuery } from 'react-query';
import { getContract, getContracts } from './contract.api';
import { ContractStatus } from '../../common/enums/contract-status.enum';

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
