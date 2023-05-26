import API from '../api';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';
import { IdentityDataFormTypes } from '../../screens/IdentityData';

export const createUserProfile = async (userProfile: ICreateUserPayload): Promise<IUserProfile> => {
  return API.post('/mobile/user', userProfile).then((res) => res.data);
};

export const getUserProfile = (): Promise<IUserProfile> => {
  return API.get('/mobile/user/profile').then((res) => res.data);
};

export const updateUserPersonalData = (updates: IdentityDataFormTypes): Promise<IUserProfile> => {
  return API.patch('/mobile/user/personal-data', updates).then((res) => res.data);
};
