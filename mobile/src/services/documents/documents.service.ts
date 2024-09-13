import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import {
  getContractsForVolunteer,
  IGetContractsForVolunteerParams,
  ISignContractPayload,
  signContract,
} from './documents.api';
import { DocumentContractStatus } from '../../common/enums/document-contract-status.enum';

export const useGetContractsInfiniteQuery = (
  volunteerId: string | undefined,
  params: IGetContractsForVolunteerParams,
) => {
  return useInfiniteQuery(
    ['contracts', volunteerId],
    ({ pageParam = 1 }) => getContractsForVolunteer({ ...params, page: pageParam }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.currentPage < lastPage?.meta.totalPages
          ? lastPage.meta.currentPage + 1
          : undefined;
      },
      enabled: !!volunteerId,
      onError: (error) => {
        console.log('⛔️ ERROR IN GET CONTRACTS INFINITE QUERY ⛔️', error);
      },
    },
  );
};

export const useGetPendingVolunteerSignatureContractsQuery = (
  volunteerId: string | undefined,
  params: IGetContractsForVolunteerParams,
) => {
  return useQuery(
    ['pending-volunteer-signature-contracts', volunteerId],
    async () => {
      const contracts = await getContractsForVolunteer(params);
      return contracts.items.filter(
        (contract: any) => contract.status === DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE,
      );
    },
    {
      onError: (error) => {
        console.log('⛔️ ERROR IN GET PENDING VOLUNTEER SIGNATURE CONTRACTS QUERY ⛔️', error);
      },
      enabled: !!volunteerId,
    },
  );
};

export const useSignContractMutation = () => {
  return useMutation(
    ['sign-contract'],
    (payload: { contractId: string; payload: ISignContractPayload }) => signContract(payload),
    {
      onError: (error) => {
        console.log('⛔️ ERROR IN SIGN CONTRACT MUTATION ⛔️', error);
      },
    },
  );
};
