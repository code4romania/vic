import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { DivisionType, IDivision } from '../../components/Divisions';
import API from '../api';

export const getDivisionData = async (
  limit: number,
  page: number,
  divisionType: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IDivision>> => {
  let requestUrl = `/divisions?divisionType=${divisionType}&limit=${limit}&page=${page}`;

  if (orderBy) requestUrl = requestUrl.concat(`&orderBy=${orderBy}`);

  if (orderDirection) requestUrl = requestUrl.concat(`&orderDirection=${orderDirection}`);

  return API.get(requestUrl).then((res) => res.data);
};
