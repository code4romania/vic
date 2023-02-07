import { IAccessRequest } from '../../common/interfaces/access-request.interface';
import API from '../api';

export const getRegistration = async (id: string): Promise<IAccessRequest> => {
  return API.get(`/volunteers/access-request/${id}`).then((res) => res.data);
};
