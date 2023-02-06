import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { DivisionType, IDivision } from '../../components/Divisions';
// import API sfrom '../api';

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
  console.log(requestUrl);

  // return API.get(requestUrl).then((res) => res.data);

  return {
    items: [
      {
        id: '1',
        name: 'Elena',
        createdBy: {
          id: '1',
          name: 'Emag',
        },
        membersCount: 20,
        createdOn: '10, 10, 2022',
      },
      {
        id: '2',
        name: 'Matei',
        createdBy: {
          id: '2',
          name: 'Altex',
        },
        membersCount: 30,
        createdOn: '11, 10, 2022',
      },
    ],
    meta: {
      currentPage: 1,
      itemCount: 5,
      itemsPerPage: 5,
      totalItems: 10,
      totalPages: 3,
      orderByColumn: 'name',
      orderDirection: OrderDirection.ASC,
    },
  };
};
