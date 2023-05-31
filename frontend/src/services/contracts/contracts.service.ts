import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { getContracts } from './contracts.api';
import { AxiosError } from 'axios';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { CONTRACT_ERRORS } from '../../common/errors/entities/contract.errors';

export const useContractsQuery = ({
  limit,
  page,
  orderBy,
  orderDirection,
}: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
}) => {
  return useQuery(
    ['contracts', limit, page, orderBy, orderDirection],
    () => getContracts({ limit, page, orderBy, orderDirection }),
    {
      onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
    },
  );
};
