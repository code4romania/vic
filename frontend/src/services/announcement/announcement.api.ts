import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAnnouncement } from '../../common/interfaces/announcement.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

export const getAnnouncements = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAnnouncement>> => {
  return API.get('/announcement', {
    params: { limit, page, orderBy, orderDirection },
  }).then((res) => res.data);
};
