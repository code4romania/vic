import API from '../api';
import { IOrganization } from '../../components/OrganizationProfile';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAccessCode } from '../../pages/AccesCodes';

export const getOrganization = async (): Promise<IOrganization> => {
  return API.get(`/organization`).then((res) => res.data);
};

export const updateOrganizationDescription = async (
  description: string,
): Promise<IOrganization> => {
  return API.patch(`/organization`, { description }).then((res) => res.data);
};

export const getAccessCodes = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessCode>> => {
  console.log('limit, page, orderBy, orderDirection', limit, page, orderBy, orderDirection);
  return API.get(`/access-code`).then((res) => {
    return {
      items: [
        {
          id: 'aa',
          code: '1123',
          startDate: new Date(),
          endDate: new Date(),
          usageCount: 10,
          createdOn: new Date(),
          createdBy: { id: 'as', name: 'ajskadhs' },
        },
      ],
      meta: {
        currentPage: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: res.data.length,
        totalPages: 1,
        orderByColumn: 'name',
        orderDirection: OrderDirection.ASC,
      },
    };
  });
};

export const createAccessCode = async (
  name: string,
  startDate: Date,
  endDate?: Date,
): Promise<IAccessCode> => {
  return API.post('access-code', { name, startDate, endDate }).then((res) => res.data);
};

export const updateAccessCode = async (id: string, endDate?: Date): Promise<IAccessCode> => {
  return API.patch(`access-code/${id}`, { endDate }).then((res) => res.data);
};
