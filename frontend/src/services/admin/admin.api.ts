import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

export const getAdminsListItems = async (params: {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<{ id: string; name: string }>> => {
  return API.get('/listing/admins', { params }).then((res) => res.data);
};
