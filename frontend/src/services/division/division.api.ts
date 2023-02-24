import { DivisionType } from '../../common/enums/division-type.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IDivision } from '../../common/interfaces/division.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

export const getDivisions = async (
  limit: number,
  page: number,
  type: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IDivision>> => {
  return API.get(`/organization-structure/${type}`, {
    params: { limit, page, orderBy, orderDirection },
  }).then((res) => res.data);
};

export const deleteDivision = async (id: string): Promise<void> => {
  return API.delete(`/organization-structure/${id}`).then((res) => res.data);
};

export const addDivision = async (name: string, type: DivisionType): Promise<IDivision> => {
  return API.post('/organization-structure', {
    name,
    type,
  }).then((res) => res.data);
};

export const editDivision = async (id: string, name: string): Promise<IDivision> => {
  return API.patch(`/organization-structure/${id}`, { name }).then((res) => res.data);
};
