import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { DivisionType, IDivision } from '../../components/Division';
import API from '../api';

export const getDivisionData = async (
  limit: number,
  page: number,
  orderBy: string,
  orderDirection: OrderDirection,
  divisionType: DivisionType,
): Promise<IPaginatedEntity<IDivision>> => {
  return API.get(
    `/divisions?divisionType=${divisionType}&limit=${limit}&page=${page}&orderBy=${orderBy}&orderDirection=${orderDirection}`,
  ).then((res) => res.data);
};

export const deleteDivision = async (id: string): Promise<void> => {
  return API.delete(`/divisions?id=${id}`).then((res) => res.data);
};
