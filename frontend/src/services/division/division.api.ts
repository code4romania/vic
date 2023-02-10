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
  // return API.get(`/organization-structure/${type}`).then((res) => {
  return {
    items: [
      {
        id: '1',
        name: 'Elena',
        numberOfMembers: 20,
        createdOn: new Date(),
        createdBy: {
          id: '1',
          name: 'Matei',
        },
        type: DivisionType.BRANCH,
      },
      {
        id: '2',
        name: 'Elena',
        numberOfMembers: 20,
        createdOn: new Date(),
        createdBy: {
          id: '1',
          name: 'Matei',
        },
        type: DivisionType.BRANCH,
      },
    ],
    meta: {
      currentPage: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalItems: 10,
      totalPages: 1,
      orderByColumn: 'name',
      orderDirection: OrderDirection.ASC,
    },
  };
  // });
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
