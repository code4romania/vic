import { useMutation, useQuery } from 'react-query';
import {
  createUserProfile,
  deleteAccount,
  getUserProfile,
  updateUserPersonalData,
  updateUserProfile,
} from './user.api';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';
import { IdentityDataFormTypes } from '../../screens/IdentityData';
import { AccountDataFormTypes } from '../../screens/AccountData';
import { ImageAttachement } from '../../common/interfaces/image-attachement.interface';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';
import useStore from '../../store/store';
import { useUserProfile } from '../../store/profile/profile.selector';

export const useCreateUserProfileMutation = () => {
  const { setUserProfile } = useStore();
  return useMutation(
    ['user-profile'],
    (userProfile: ICreateUserPayload) => createUserProfile(userProfile),
    {
      onSuccess: (data: IUserProfile) => {
        setUserProfile({ ...data, myOrganizations: [] });
      },
    },
  );
};

export const useGetUserProfileQuery = () => {
  const { setUserProfile } = useStore();
  const { userProfile } = useUserProfile();
  return useQuery(['user-profile'], () => getUserProfile(), {
    onSuccess: (data: IUserProfile) => {
      if (
        data.activeOrganization?.id !== userProfile?.activeOrganization?.id ||
        data.myOrganizations.length !== userProfile?.myOrganizations.length
      ) {
        setUserProfile({ ...data });
      }
    },
  });
};

export const useUpdateUserPersonalDataMutation = () => {
  const { setIdentityData } = useStore();
  return useMutation(
    ['personal-data'],
    (personalData: IdentityDataFormTypes) => updateUserPersonalData(personalData),
    { onSuccess: (data: IUserProfile) => setIdentityData(data.userPersonalData) },
  );
};

export const useUpdateUserProfileMutation = () => {
  const { setUserProfile, userProfile: oldProfile } = useStore();
  return useMutation(
    ['update-profile'],
    ({
      userProfile,
      profilePicture,
    }: {
      userProfile: AccountDataFormTypes;
      profilePicture?: ImageAttachement;
    }) => updateUserProfile(userProfile, profilePicture),
    { onSuccess: (data) => setUserProfile({ ...oldProfile, ...data }) },
  );
};

export const useDeleteAccountMutation = () => {
  return useMutation(['delete-account'], () => deleteAccount());
};
