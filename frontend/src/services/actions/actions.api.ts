import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAction } from '../../common/interfaces/action.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

export const getActions = (params: {
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
  authordId?: string;
  actionStartDate?: Date;
  actionEndDate?: Date;
}): Promise<IPaginatedEntity<IAction>> => {
  return API.get('/actions-archive', {
    params,
  }).then((res) => res.data);
};
