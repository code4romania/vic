import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { DivisionType, IDivision } from '../../components/Divisions';
import API from '../api';

export const getDivisions = async (
  limit: number,
  page: number,
  type: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IDivision>> => {
  console.log('limit, page, orderBy, orderDirection', limit, page, orderBy, orderDirection);
  return API.get(`/organization-structure/${type}`).then((res) => res.data);
};

export const deleteDivision = async (id: string): Promise<void> => {
  return API.delete(`/divisions/${id}`).then((res) => res.data);
};
