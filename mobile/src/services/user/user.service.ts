import { useMutation } from 'react-query';
import { createUserProfile, getUserProfile, updateUserPersonalData } from './user.api';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';
import { IdentityDataFormTypes } from '../../screens/IdentityData';

export const useUserProfile = () => {
  return useMutation(['user-profile'], () => getUserProfile());
};

export const useCreateUserProfileMutation = () => {
  return useMutation(['user-profile'], (userProfile: ICreateUserPayload) =>
    createUserProfile(userProfile),
  );
};

export const useUpdateUserPersonalDataMutation = () => {
  return useMutation(['personal-data'], (personalData: IdentityDataFormTypes) =>
    updateUserPersonalData(personalData),
  );
};
