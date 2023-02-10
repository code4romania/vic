import { IAccessRequest } from '../../pages/AccessRequests';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
// import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';

export const getRegistrationRequests = async (
  filterStatus: string,
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  // return API.get('/volunteers/registration-requests', {
  //   params: { limit, page, filterStatus, orderBy, orderDirection },
  // }).then((res) => res.data);

  return Promise.resolve({
    items: [
      {
        id: 'aasad',
        logo: 'https://plus.unsplash.com/premium_photo-1661692476630-06945685910e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        name: 'asdasa',
        address: 'aksdhaks',
        email: 'email.com',
        phone: '0765173766',
        createdOn: new Date(),
        updatedOn: new Date(),
      },
    ],
    meta: {
      status: filterStatus,
      currentPage: page,
      itemCount: 3,
      itemsPerPage: limit,
      totalItems: 7,
      totalPages: 2,
      orderByColumn: orderBy || 'name',
      orderDirection: orderDirection || OrderDirection.ASC,
    },
  });
};
