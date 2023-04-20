import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAction } from '../../common/interfaces/action.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { formatEndDateISO9075, formatStartDateISO9075 } from '../../common/utils/utils';
import API from '../api';

export const getActions = (params: {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
  author?: string;
  actionStartDate?: Date;
  actionEndDate?: Date;
}): Promise<IPaginatedEntity<IAction>> => {
  return API.get('/actions-archive', {
    params: {
      ...params,
      ...(params.actionStartDate
        ? { actionStartDate: formatStartDateISO9075(params.actionStartDate) }
        : {}),
      ...(params.actionEndDate
        ? { actionEndDate: formatEndDateISO9075(params.actionEndDate) }
        : {}),
    },
  }).then((res) => res.data);
};
