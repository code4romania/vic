import { IUser } from '../../common/interfaces/user.interface';
// import API from '../api';

export const login = async (): Promise<IUser> => {
  // return API.post('auth/login').then((res) => res.data);
  return Promise.resolve({ id: 'HahaProduction', name: 'Andrei Milioane' });
};
