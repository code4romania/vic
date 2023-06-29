import { useMutation } from 'react-query';
import { createUserProfile, updateUserPersonalData, updateUserProfile } from './user.api';
import { ICreateUserPayload } from '../../common/interfaces/create-user-payload.interface';
import { IdentityDataFormTypes } from '../../screens/IdentityData';
import { AccountDataFormTypes } from '../../screens/AccountData';
import { ImageAttachement } from '../../common/interfaces/image-attachement.interface';
import { useAuth } from '../../hooks/useAuth';

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

export const useUpdateUserProfileMutation = () => {
  const { setUserProfile } = useAuth();
  return useMutation(
    ['update-profile'],
    ({
      userProfile,
      profilePicture,
    }: {
      userProfile: AccountDataFormTypes;
      profilePicture?: ImageAttachement;
    }) => updateUserProfile(userProfile, profilePicture),
    { onSuccess: (data) => setUserProfile(data) },
  );
};
