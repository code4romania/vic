import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ANNOUNCEMENT_ERRORS } from '../../common/errors/entities/announcement.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
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
      onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => error,
    },
  );
};
