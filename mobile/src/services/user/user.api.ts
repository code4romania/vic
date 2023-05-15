import API from '../api';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';

export const createUserProfile = async (userProfile: ICreateUserPayload): Promise<IUserProfile> => {
  return API.post('/mobile/user', userProfile).then((res) => res.data);
};

export const getUserProfile = (): Promise<IUserProfile> => {
  return API.get('/mobile/user/profile').then((res) => res.data);
};
