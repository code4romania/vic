import { AnnouncementStatus } from '../../common/enums/announcement-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAnnouncement } from '../../common/interfaces/announcement.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { AnnouncementFormTypes } from '../../components/AnnouncementForm';
import API from '../api';

export const getAnnouncements = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  searchWord?: string,
  status?: AnnouncementStatus,
  targetsIds?: string[],
): Promise<IPaginatedEntity<IAnnouncement>> => {
  return API.get('/announcement', {
    params: { limit, page, orderBy, orderDirection, searchWord, status, targetsIds },
  }).then((res) => res.data);
};

export const getAnnouncement = async (id: string): Promise<IAnnouncement> => {
  return API.get(`/announcement/${id}`).then((res) => res.data);
};

export const addAnnouncement = async (
  anouncement: AnnouncementFormTypes,
): Promise<IAnnouncement> => {
  const { targets, ...anouncementPayload } = anouncement;
  return API.post(`/announcement`, {
    ...anouncementPayload,
    ...(targets?.length > 0 ? { targetsIds: targets.map((target) => target.key) } : {}),
  }).then((res) => res.data);
};

export const updateAnnouncement = async (
  id: string,
  updateData: Partial<AnnouncementFormTypes>,
): Promise<IAnnouncement> => {
  const { targets, ...anouncementPayload } = updateData;
  return API.patch(`/announcement/${id}`, {
    ...anouncementPayload,
    ...(targets && targets?.length > 0 ? { targetsIds: targets.map((target) => target.key) } : {}),
  }).then((res) => res.data);
};

export const deleteAnnouncement = async (id: string): Promise<string> => {
  return API.delete(`/announcement/${id}`).then((res) => res.data);
};
