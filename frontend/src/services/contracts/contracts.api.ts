import { ContractStatus } from '../../common/enums/contract-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IContract, IContractListItem } from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { AddContractFormTypes } from '../../pages/AddContract';
// import API from '../api';

export const getContracts = (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
  volunteer?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ContractStatus;
}): Promise<IPaginatedEntity<IContractListItem>> => {
  // return API.get('', { params }).then((res) => res.data);
  console.log(params);
  return Promise.resolve({
    items: [
      {
        id: '1',
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
        id: '2',
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
        id: '3',
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
        id: '4',
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
        id: '5',
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
        id: '6',
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

export const getContract = (id: string): Promise<IContract> => {
  // return API.get(`/${id}`).then((res) => res.data);
  return Promise.resolve({
    id,
    number: 12345,
    volunteer: { id: 'VOL001', name: 'John Doe' },
    status: ContractStatus.VALIDATE_ONG,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-12-31'),
    signed: 'John Doe',
    template: { id: 'TMPL001', name: 'Volunteer Contract Template' },
    generatedBy: { id: 'USR001', name: 'Admin User' },
    generatedOn: new Date('2023-05-30'),
    // approvedOn: new Date('2023-05-31'),
    // rejectedBy: { id: 'USR002', name: 'Manager User' },
    // rejectedOn: new Date('2023-05-31'),
    // rejectionReason: 'Insufficient experience',
  });
};

export const addContract = (data: AddContractFormTypes): Promise<void> => {
  // return API.post('', { ...data });
  console.log(data);
  return Promise.resolve();
};

export const rejectContract = (id: string, rejectionReason?: string): Promise<void> => {
  // return API.patch(`/documents/contracts/${id}/reject`, { rejectionReason });
  console.log(id, rejectionReason);
  return Promise.resolve();
};

export const approveContract = (id: string): Promise<void> => {
  // return API.patch(`/documents/contracts/${id}/approve`);
  console.log(id);
  return Promise.resolve();
};
