import { AnnouncementStatus, AnnouncementType } from '../../common/enums/announcement-status.enum';
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
  search?: string,
  status?: AnnouncementStatus,
  type?: AnnouncementType,
): Promise<IPaginatedEntity<IAnnouncement>> => {
  return API.get('/announcement', {
    params: { limit, page, orderBy, orderDirection, search, status, type },
  }).then((res) => res.data);
};

export const getAnnouncement = async (id: string): Promise<IAnnouncement> => {
  return API.get(`/announcement/${id}`).then((res) => res.data);
};

const formatPayload = (data: Partial<AnnouncementFormTypes>): object => ({
  ...data,
  // null clears the number of volunteers needed
  volunteersNeeded: data.volunteersNeeded || null,
  // null clears the end of the display period
  displayEndDate: data.displayEndDate || null,
});

export const addAnnouncement = async (
  anouncement: AnnouncementFormTypes,
): Promise<IAnnouncement> => {
  return API.post(`/announcement`, formatPayload(anouncement)).then((res) => res.data);
};

export const updateAnnouncement = async (
  id: string,
  updateData: Partial<AnnouncementFormTypes>,
): Promise<IAnnouncement> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { publishNow, ...data } = updateData;
  return API.patch(`/announcement/${id}`, formatPayload(data)).then((res) => res.data);
};

export type AnnouncementStatusAction = 'activate' | 'deactivate' | 'archive';

export const changeAnnouncementStatus = async (
  id: string,
  action: AnnouncementStatusAction,
): Promise<IAnnouncement> => {
  return API.patch(`/announcement/${id}/${action}`).then((res) => res.data);
};

export const deleteAnnouncement = async (id: string): Promise<string> => {
  return API.delete(`/announcement/${id}`).then((res) => res.data);
};

// #504: volunteers' answers from the app
export interface IAnnouncementResponse {
  id: string;
  comment: string;
  createdOn: Date;
  user: { id: string; name: string; email: string };
  volunteerId: string | null;
}

export const getAnnouncementResponses = async (
  id: string,
  page: number,
  limit: number,
): Promise<IPaginatedEntity<IAnnouncementResponse>> => {
  return API.get(`/announcement/${id}/responses`, { params: { page, limit } }).then(
    (res) => res.data,
  );
};
