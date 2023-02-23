import { AnnouncementStatus } from '../../common/enums/announcement-status.enum';
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
  }).then(() => ({
    // items: res.data,
    items: [
      {
        id: '1',
        name: 'Hello',
        description: 'hello',
        updatedOn: new Date(),
        status: AnnouncementStatus.DRAFT,
        publishedOn: null,
        targets: [],
      },
    ],
    meta: {
      itemCount: 1,
      itemsPerPage: 5,
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
      orderByColumn: 'name',
      orderDirection: OrderDirection.ASC,
    },
  }));
};
