import { OrderDirection } from '../../common/enums/sort-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { DivisionType, IDivision } from '../../components/Division';
import API from '../api';

export const getTestValues = async () => {
  return API.get('anything').then((res) => res.data);
};

export const getDivisionData = async (
  limit: number,
  page: number,
  orderBy: string,
  orderDirection: OrderDirection,
  divisionType: DivisionType,
): Promise<IPaginatedEntity<IDivision>> => {
  console.log(divisionType);
  return API.get(
    `/divisions?divisionType=${divisionType}&limit=${limit}&page=${page}&orderBy=${orderBy}&orderDirection=${orderDirection}`,
  ).then((res) => res.data);
};
