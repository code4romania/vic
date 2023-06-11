import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { getContracts } from './contracts.api';
import { AxiosError } from 'axios';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { CONTRACT_ERRORS } from '../../common/errors/entities/contract.errors';
import { ContractStatus } from '../../common/enums/contract-status.enum';

export const useContractsQuery = ({
  limit,
  page,
  orderBy,
  orderDirection,
  search,
  volunteer,
  startDate,
  endDate,
  status,
}: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
  volunteer?: string;
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
      volunteer,
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
        volunteer,
        startDate,
        endDate,
        status,
      }),
    {
      onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
    },
  );
};
