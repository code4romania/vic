import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAnnouncement, ISaveAnnouncement } from '../../common/interfaces/announcement.interface';
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

export const getAnnouncement = async (id: string): Promise<IAnnouncement> => {
  return API.get(`/announcement/${id}`).then((res) => res.data);
};

export const addAnnouncement = async (createData: ISaveAnnouncement): Promise<IAnnouncement> => {
  return API.post(`/announcement`, createData).then((res) => res.data);
};

export const updateAnnouncement = async (
  id: string,
  updateData: ISaveAnnouncement,
): Promise<IAnnouncement> => {
  return API.patch(`/announcement/${id}`, updateData).then((res) => res.data);
};

export const deleteAnnouncement = async (id: string): Promise<string> => {
  return API.delete(`/announcement/${id}`).then((res) => res.data);
};
