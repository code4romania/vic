import { useMutation } from 'react-query';
import { createUserProfile, getUserProfile } from './user.api';
import { UserFormTypes } from '../../screens/CreateUser';

export const useUserProfile = () => {
  return useMutation(['user-profile'], () => getUserProfile());
};

export const useCreateUserProfileMutation = () => {
  return useMutation(['user-profile'], (userProfile: UserFormTypes) =>
    createUserProfile(userProfile),
  );
};
