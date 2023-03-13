import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { AnnouncementStatus } from '../../common/enums/announcement-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ANNOUNCEMENT_ERRORS } from '../../common/errors/entities/announcement.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { AnnouncementFormTypes } from '../../components/AnnouncementForm';
import {
  addAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from './announcement.api';

export const useAnnouncements = (
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
  searchWord?: string,
  status?: AnnouncementStatus,
  targetsIds?: string[],
) => {
  return useQuery(
    ['announcement', limit, page, orderBy, orderDirection, searchWord, status, targetsIds],
    () => getAnnouncements(limit, page, orderBy, orderDirection, searchWord, status, targetsIds),
    {
      onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => error,
    },
  );
};

export const useAnnouncement = (id: string) => {
  return useQuery(['announcement', id], () => getAnnouncement(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => error,
  });
};

export const useCreateAnnouncementMutation = () => {
  return useMutation((anouncement: AnnouncementFormTypes) => addAnnouncement(anouncement), {
    onError: (error: AxiosError<IBusinessException<ANNOUNCEMENT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useUpdateAnnouncementMutation = () => {
  return useMutation(
    ({ id, updateData }: { id: string; updateData: Partial<AnnouncementFormTypes> }) =>
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
