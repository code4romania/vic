import { IUser } from '../../common/interfaces/user.interface';
import API from '../api';

export const login = async (): Promise<IUser> => {
  return API.post('auth/login').then((res) => res.data);
};
