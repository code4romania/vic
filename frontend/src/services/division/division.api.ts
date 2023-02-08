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
  console.log(limit, page, divisionType, orderBy, orderDirection);
  return {
    items: [
      {
        id: '1',
        name: 'Emag',
        createdBy: {
          id: '1',
          name: 'Matei',
        },
        membersCount: 20,
        createdOn: new Date(),
      },
      {
        id: '2',
        name: 'Altex',
        createdBy: {
          id: '1',
          name: 'Matei',
        },
        membersCount: 20,
        createdOn: new Date(),
      },
      {
        id: '3',
        name: 'Orange',
        createdBy: {
          id: '1',
          name: 'Matei',
        },
        membersCount: 20,
        createdOn: new Date(),
      },
    ],
    meta: {
      itemCount: 5,
      totalItems: 10,
      totalPages: 3,
      itemsPerPage: 10,
      currentPage: 1,
      orderByColumn: 'name',
      orderDirection: OrderDirection.ASC,
    },
  };
  // return API.get(`/divisions`, {
  //   params: { divisionType, limit, page, orderBy, orderDirection },
  // }).then((res) => res.data);
};

export const deleteDivision = async (id: string): Promise<void> => {
  return API.delete(`/divisions/${id}`).then((res) => res.data);
};
