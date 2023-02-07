import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAccessCode } from '../../pages/ViewAccesCodes';
import API from '../api';

export const getAccessCodes = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessCode>> => {
  return API.get(`/access-codes`, { params: { limit, page, orderBy, orderDirection } }).then(
    (res) => res.data,
  );
};
