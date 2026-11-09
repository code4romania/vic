import { useMutation, useQuery } from 'react-query';
import {
  IContractsQueryParams,
  deleteContract,
  getContracts,
  getPendingContractsCount,
  uploadContract,
} from './contracts.api';
import { AxiosError } from 'axios';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { CONTRACT_ERRORS } from '../../common/errors/entities/contract.errors';
import { IUploadContractPayload } from '../../common/interfaces/contract.interface';

export const useContractsQuery = (
  params: IContractsQueryParams & { page: number; limit: number },
) => {
  return useQuery(['contracts', params], () => getContracts(params), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
  });
};

// #488: contracts shown as "În așteptare"
export const usePendingContractsCountQuery = () => {
  return useQuery(['contracts-pending-count'], () => getPendingContractsCount(), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
  });
};

export const useUploadContractMutation = () => {
  return useMutation((payload: IUploadContractPayload) => uploadContract(payload), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useDeleteContractMutation = () => {
  return useMutation((id: string) => deleteContract(id), {
    onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => Promise.resolve(error),
  });
};
