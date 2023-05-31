import { ContractStatus } from '../../common/enums/contract-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IContractListItem } from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
// import API from '../api';

export const getContracts = (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
}): Promise<IPaginatedEntity<IContractListItem>> => {
  // return API.get('', { params }).then((res) => res.data);
  console.log(params);
  return Promise.resolve({
    items: [
      {
        id: 1,
        number: 12345,
        volunteer: {
          id: 'volunteer1',
          name: 'John Doe',
        },
        status: ContractStatus.ACTIVE,
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-12-31'),
      },
      {
        id: 2,
        number: 67890,
        volunteer: {
          id: 'volunteer2',
          name: 'Jane Smith',
        },
        status: ContractStatus.CLOSED,
        startDate: new Date('2021-05-15'),
        endDate: new Date('2021-06-30'),
      },
      {
        id: 3,
        number: 54321,
        volunteer: {
          id: 'volunteer3',
          name: 'Alex Johnson',
        },
        status: ContractStatus.NOT_STARTED,
        startDate: new Date('2023-02-15'),
        endDate: new Date('2023-03-31'),
      },
      {
        id: 4,
        number: 98765,
        volunteer: {
          id: 'volunteer4',
          name: 'Sarah Thompson',
        },
        status: ContractStatus.REJECTED,
        startDate: new Date('2023-04-01'),
        endDate: new Date('2023-09-30'),
      },
      {
        id: 5,
        number: 13579,
        volunteer: {
          id: 'volunteer5',
          name: 'Michael Wilson',
        },
        status: ContractStatus.VALIDATE_ONG,
        startDate: new Date('2022-09-01'),
        endDate: new Date('2022-11-30'),
      },
      {
        id: 6,
        number: 24680,
        volunteer: {
          id: 'volunteer6',
          name: 'Emily Davis',
        },
        status: ContractStatus.VALIDATE_VOLUNTEER,
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-06-30'),
      },
    ],
    meta: {
      currentPage: params.page,
      itemCount: 3,
      itemsPerPage: params.limit,
      totalItems: 3,
      totalPages: 1,
      orderByColumn: 'name',
      orderDirection: OrderDirection.ASC,
    },
  });
};
