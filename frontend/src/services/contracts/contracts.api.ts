import { ContractStatus } from '../../common/enums/contract-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IContract, IContractListItem } from '../../common/interfaces/contract.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAddContractPayload } from './contracts.service';
import API from '../api';

export const addContract = async (data: IAddContractPayload): Promise<void> => {
  return API.post('contract', data).then((res) => res.data);
};

export const getContracts = async (params: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
  volunteerName?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ContractStatus;
}): Promise<IPaginatedEntity<IContractListItem>> => {
  return API.get('contract', { params }).then((res) => res.data);
};

export const getContract = (id: string): Promise<IContract> => {
  // return API.get(`/${id}`).then((res) => res.data);
  return Promise.resolve({
    id,
    number: 12345,
    volunteer: { id: 'VOL001', name: 'John Doe' },
    status: ContractStatus.PENDING_ADMIN,
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

export const deleteContract = (id: string): Promise<void> => {
  // return API.delete(`/documents/contracts/${id}`).then((res) => res.data);
  console.log(id);
  return Promise.resolve();
};

export const rejectContract = (id: string, rejectMessage?: string): Promise<void> => {
  // return API.patch(`/documents/contracts/${id}/reject`, { rejectMessage });
  console.log(id, rejectMessage);
  return Promise.resolve();
};

export const approveContract = (id: string): Promise<void> => {
  // return API.patch(`/documents/contracts/${id}/approve`);
  console.log(id);
  return Promise.resolve();
};
