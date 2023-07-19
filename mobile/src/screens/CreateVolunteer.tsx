import React, { useEffect } from 'react';
import ModalLayout from '../layouts/ModalLayout';
import { useCreateVolunteerProfileMutation } from '../services/volunteer/volunteer.service';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import VolunteerForm, { VolunteerFormTypes, volunteerSchema } from '../components/VolunteerForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useUserProfile } from '../store/profile/profile.selector';

const CreateVolunteer = ({ navigation, route }: any) => {
  // get user profile data
  const { userProfile } = useUserProfile();
  // get volunteer id
  const { volunteerId } = route.params;
  // translations
  const { t } = useTranslation('create_volunteer');

  // form
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<VolunteerFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(volunteerSchema as any),
  });

  const { isLoading: isCreatingProfile, mutate: createVolunteerProfile } =
    useCreateVolunteerProfileMutation();

  useEffect(() => {
    if (userProfile) {
      reset({ email: userProfile.email, phone: userProfile.phone });
    }
  }, [userProfile, reset]);

  const onSubmit = (profile: VolunteerFormTypes) => {
    createVolunteerProfile(
      {
        profile: {
          ...profile,
          roleId: profile.roleId || undefined,
          departmentId: profile.departmentId || undefined,
          branchId: profile.branchId || undefined,
        },
        volunteerId,
      },
      {
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.VOLUNTEER_PROFILE_ERRORS.getError(
              error.response?.data.code_error,
            )}`,
          });
        },
        onSuccess: () => navigation.navigate('volunteer'),
      },
    );
  };

  return (
    <ModalLayout
      title={t('heading')}
      actionsOptions={{
        onActionButtonClick: handleSubmit(onSubmit),
        actionLabel: t('general:save'),
        loading: isCreatingProfile,
      }}
      onDismiss={navigation.goBack}
    >
      <VolunteerForm
        paragraph={`${t('paragraph')}`}
        isLoading={isCreatingProfile}
        control={control}
        errors={errors}
      />
    </ModalLayout>
  );
};

export default CreateVolunteer;
