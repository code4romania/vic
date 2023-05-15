import { useMutation } from 'react-query';
import { createUserProfile, getUserProfile } from './user.api';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';

export const useUserProfile = () => {
  return useMutation(['user-profile'], () => getUserProfile());
};

export const useCreateUserProfileMutation = () => {
  return useMutation(['user-profile'], (userProfile: ICreateUserPayload) =>
    createUserProfile(userProfile),
  );
};
