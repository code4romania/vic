import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ACTIONS_ERRORS } from '../../common/errors/entities/actions.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getActions } from './actions.api';

export const useActionsQuery = (params: {
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
  authordId?: string;
  actionStartDate?: Date;
  actionEndDate?: Date;
}) => {
  return useQuery(
    [
      'actions',
      params.search,
      params.orderBy,
      params.orderDirection,
      params.authordId,
      params.actionStartDate,
      params.actionEndDate,
    ],
    () => getActions(params),
    {
      onError: (error: AxiosError<IBusinessException<ACTIONS_ERRORS>>) => error,
    },
  );
};
