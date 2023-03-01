import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ANNOUNCEMENT_ERRORS } from '../../common/errors/entities/announcement.errors';
import { ISaveAnnouncement } from '../../common/interfaces/announcement.interface';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  addAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from './announcement.api';

export const useAnnouncementsQuery = (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['announcement', limit, page, orderBy, orderDirection],
    () => getAnnouncements(limit, page, orderBy, orderDirection),
    {
      onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => error,
    },
  );
};

export const useAnnouncementQuery = (id: string) => {
  return useQuery(['announcement', id], () => getAnnouncement(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => error,
  });
};

export const useCreateAnnouncementMutation = () => {
  return useMutation((createData: ISaveAnnouncement) => addAnnouncement(createData), {
    onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useUpdateAnnouncementMutation = () => {
  return useMutation(
    ({ id, updateData }: { id: string; updateData: Partial<ISaveAnnouncement> }) =>
      updateAnnouncement(id, updateData),
    {
      onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useDeleteAnnouncementMutation = () => {
  return useMutation((id: string) => deleteAnnouncement(id), {
    onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => Promise.resolve(error),
  });
};
