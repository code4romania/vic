import API from '../api';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';
import { AccountDataFormTypes } from '../../screens/AccountData';
import { ImageAttachement } from '../../common/interfaces/image-attachement.interface';

export const createUserProfile = async (userProfile: ICreateUserPayload): Promise<IUserProfile> => {
  return API.post('/mobile/user', userProfile).then((res) => res.data);
};

export const getUserProfile = async (): Promise<IUserProfile> => {
  return API.get('/mobile/user/profile').then((res) => res.data);
};

export interface UserPersonalDataPayload {
  cnp: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
  identityDocumentIssuedBy: string;
  legalGuardian?: {
    name: string;
    identityDocumentSeries: string;
    identityDocumentNumber: string;
    email: string;
    phone: string;
  };
}
export const updateUserPersonalData = async (
  updates: UserPersonalDataPayload,
): Promise<IUserProfile> => {
  return API.patch('/mobile/user/personal-data', updates).then((res) => res.data);
};

export const updateUserProfile = async (
  updates: AccountDataFormTypes,
  profilePicture?: ImageAttachement,
): Promise<IUserProfile> => {
  const formData = new FormData();

  formData.append('firstName', updates.firstName);
  formData.append('lastName', updates.lastName);
  formData.append('phone', updates.phone);
  if (updates.cityId) {
    formData.append('locationId', updates.cityId.toString());
  }
  if (updates.birthday) {
    formData.append('birthday', updates.birthday.toISOString());
  }
  if (updates.sex) {
    formData.append('sex', updates.sex);
  }

  if (profilePicture) {
    formData.append('profilePicture', profilePicture as any);
  }

  return API.patch('/mobile/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const deleteAccount = async () => {
  return API.delete('/mobile/user').then((res) => res.data);
};
