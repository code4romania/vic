import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { DivisionType, IDivision } from '../../components/Divisions';
import API from '../api';

export const getDivisions = async (
  limit: number,
  page: number,
  divisionType: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IDivision>> => {
  return API.get(`/divisions`, {
    params: { divisionType, limit, page, orderBy, orderDirection },
  }).then((res) => res.data);
};
