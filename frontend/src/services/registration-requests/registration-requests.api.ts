import { IAccessRequest } from '../../pages/RegistrationRequests';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';

export const getRegistrationRequests = async (
  filterStatus: string,
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/volunteers/registration-requests', {
    params: { limit, page, filterStatus, orderBy, orderDirection },
  }).then((res) => res.data);
  // console.log(status);
  // return Promise.resolve({
  //   items: [
  //     {
  //       id: '1',
  //       logo: 'https://company1.com/logo.png',
  //       name: 'Company 1',
  //       address: 'San Francisco, CA, USA',
  //       email: 'info@company1.com',
  //       phone: '+1 123 456 7890',
  //       createdOn: '2022-01-01T12:00:00.000Z',
  //     },
  //     {
  //       id: '2',
  //       logo: 'https://company2.com/logo.png',
  //       name: 'Company 2',
  //       address: 'New York, NY, USA',
  //       email: 'info@company2.com',
  //       phone: '+1 234 567 8901',
  //       createdOn: '2022-02-01T12:00:00.000Z',
  //     },
  //     {
  //       id: '3',
  //       logo: 'https://company3.com/logo.png',
  //       name: 'Company 3',
  //       address: 'London, UK',
  //       email: 'info@company3.com',
  //       phone: '+44 123 456 7890',
  //       createdOn: '2022-03-01T12:00:00.000Z',
  //     },
  //     {
  //       id: '4',
  //       logo: 'https://company4.com/logo.png',
  //       name: 'Company 4',
  //       address: 'Berlin, Germany',
  //       email: 'info@company4.com',
  //       phone: '+49 123 456 7890',
  //       createdOn: '2022-04-01T12:00:00.000Z',
  //     },
  //     {
  //       id: '5',
  //       logo: 'https://company5.com/logo.png',
  //       name: 'Company 5',
  //       address: 'Paris, France',
  //       email: 'info@company5.com',
  //       phone: '+33 123 456 7890',
  //       createdOn: '2022-05-01T12:00:00.000Z',
  //     },
  //     {
  //       id: '6',
  //       logo: 'https://company6.com/logo.png',
  //       name: 'Company 6',
  //       address: 'Sydney, Australia',
  //       email: 'info@company6.com',
  //       phone: '+61 123 456 7890',
  //       createdOn: '2022-06-01T12:00:00.000Z',
  //     },
  //     {
  //       id: '7',
  //       logo: 'https://company7.com/logo.png',
  //       name: 'Company 7',
  //       address: 'Tokyo, Japan',
  //       email: 'info@company7.com',
  //       phone: '+81 123 456 7890',
  //       createdOn: '2022-07-01T12:00:00.000Z',
  //     },
  //   ],
  //   meta: {
  //     currentPage: 3,
  //     itemCount: 3,
  //     itemsPerPage: 3,
  //     totalItems: 3,
  //     totalPages: 3,
  //     orderByColumn: 'name',
  //     orderDirection: 'ASC',
  //   },
  // });
};
