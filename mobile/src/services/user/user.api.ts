import API from '../api';
import { birthdayToApi } from '../../common/utils/birthday';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';
import { AccountDataFormTypes } from '../../screens/AccountData';
import { ImageAttachement } from '../../common/interfaces/image-attachement.interface';
import type { AppLanguage } from '../../common/config/language';

export const createUserProfile = async (userProfile: ICreateUserPayload): Promise<IUserProfile> => {
  return API.post('/mobile/user', userProfile).then((res) => res.data);
};

export const getUserProfile = async (): Promise<IUserProfile> => {
  return API.get('/mobile/user/profile').then((res) => res.data);
};

export const updateUserProfile = async (
  updates: AccountDataFormTypes,
  profilePicture?: ImageAttachement,
): Promise<IUserProfile> => {
  const formData = new FormData();

  formData.append('firstName', updates.firstName);
  formData.append('lastName', updates.lastName);
  // Always send the phone: an empty value clears a saved number (omitting it keeps the old one)
  formData.append('phone', updates.phone ?? '');
  if (updates.cityId) {
    formData.append('locationId', updates.cityId.toString());
  }
  if (updates.birthday) {
    formData.append('birthday', birthdayToApi(updates.birthday).toISOString());
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

// `explicit`: a choice made in the switcher, which replaces the account's language. Without it the
// backend only fills an account that has no language yet. Answers with the language it keeps.
export const setUserLanguage = async (
  language: AppLanguage,
  explicit: boolean,
): Promise<{ language: AppLanguage }> => {
  return API.patch('/mobile/user/language', { language, explicit }).then((res) => res.data);
};

export const deleteAccount = async () => {
  return API.delete('/mobile/user').then((res) => res.data);
};
