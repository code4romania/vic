import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { getAnnouncements } from './announcement.api';

export const useGetAllAnnouncementsQuery = (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['announcement', limit, page, orderBy, orderDirection],
    () => getAnnouncements(limit, page, orderBy, orderDirection),
    {
      enabled: !!(limit && page),
    },
  );
};
