import { useMutation, useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import {
  addContract,
  approveContract,
  deleteContract,
  getActiveCountractsCount,
  getContract,
  getContracts,
  rejectContract,
} from './contracts.api';
import { AxiosError } from 'axios';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { CONTRACT_ERRORS } from '../../common/errors/entities/contract.errors';
import { ContractStatus } from '../../common/enums/contract-status.enum';

export interface IAddContractPayload {
  volunteerId: string;
  templateId: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
}

export const useContractsQuery = ({
  limit,
  page,
  orderBy,
  orderDirection,
  search,
  volunteerName,
  startDate,
  endDate,
  status,
}: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
  volunteerName?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ContractStatus;
}) => {
  return useQuery(
    [
      'contracts',
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      volunteerName,
      startDate,
      endDate,
      status,
    ],
    () =>
      getContracts({
        limit,
        page,
        orderBy,
        orderDirection,
        search,
        volunteerName,
        startDate,
        endDate,
        status,
      }),
    {
      onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
    },
  );
};

export const useActiveContractsCountQuery = () => {
  return useQuery(['active-counr'], () => getActiveCountractsCount(), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
  });
};

export const useContractQuery = (id: string) => {
  return useQuery(['contract', id], () => getContract(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
  });
};

export const useDeleteContractMutation = () => {
  return useMutation(['contract'], (id: string) => deleteContract(id), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useAddContractMutation = () => {
  return useMutation((data: IAddContractPayload) => addContract(data), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useApproveContractMutation = () => {
  return useMutation((id: string) => approveContract(id), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useRejectContractMutation = () => {
  return useMutation(
    ({ id, rejectMessage }: { id: string; rejectMessage?: string }) =>
      rejectContract(id, rejectMessage),
    {
      onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => Promise.resolve(error),
    },
  );
};
