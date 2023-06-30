import { useMutation } from 'react-query';
import { createUserProfile, updateUserPersonalData, updateUserProfile } from './user.api';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';
import { IdentityDataFormTypes } from '../../screens/IdentityData';
import { AccountDataFormTypes } from '../../screens/AccountData';
import { ImageAttachement } from '../../common/interfaces/image-attachement.interface';
import { useAuth } from '../../hooks/useAuth';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';

export const useCreateUserProfileMutation = () => {
  const { setUserProfile } = useAuth();
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

export const useUpdateUserPersonalDataMutation = () => {
  const { setIdentityData } = useAuth();
  return useMutation(
    ['personal-data'],
    (personalData: IdentityDataFormTypes) => updateUserPersonalData(personalData),
    { onSuccess: (data: IUserProfile) => setIdentityData(data.userPersonalData) },
  );
};

export const useUpdateUserProfileMutation = () => {
  const { setUserProfile, userProfile: oldProfile } = useAuth();
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
