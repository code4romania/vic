import { useMutation, useQuery, UseQueryResult } from 'react-query';
import {
  IDocumentContract,
  getContract,
  getContractsForVolunteer,
  IGetContractsForVolunteerParams,
  IRejectContractPayload,
  ISignContractPayload,
  rejectContract,
  signContract,
} from './documents.api';

export const useGetContractsQuery = (
  volunteerId: string | undefined,
  params: IGetContractsForVolunteerParams,
) => {
  return useQuery({
    queryKey: ['contracts', volunteerId],
    queryFn: () => getContractsForVolunteer({ ...params }),
    enabled: !!volunteerId,
    onError: (error) => {
      console.log('⛔️ ERROR IN GET ALL CONTRACTS QUERY ⛔️', error);
    },
  });
};

export const useGetContractQuery = (
  contractId: string | undefined,
  organizationId: string | undefined,
): UseQueryResult<IDocumentContract> => {
  return useQuery({
    queryKey: ['contract', 'contractId', contractId, 'organizationId', organizationId] as const,
    queryFn: () =>
      contractId && organizationId ? getContract(contractId, organizationId) : undefined,
    enabled: !!contractId && !!organizationId,
    onError: (error) => {
      console.log('⛔️ ERROR IN GET CONTRACT QUERY ⛔️', error);
    },
  });
};

export const useSignContractMutation = () => {
  return useMutation({
    mutationKey: ['sign-contract'],
    mutationFn: (payload: { contractId: string | undefined; payload: ISignContractPayload }) =>
      signContract(payload),
    onError: (error) => {
      console.log('⛔️ ERROR IN SIGN CONTRACT MUTATION ⛔️', error);
    },
  });
};

export const useRejectContractMutation = () => {
  return useMutation({
    mutationKey: ['reject-contract'],
    mutationFn: (payload: IRejectContractPayload) => rejectContract(payload),
    onError: (error) => {
      console.log('⛔️ ERROR IN REJECT CONTRACT MUTATION ⛔️', error);
    },
  });
};
