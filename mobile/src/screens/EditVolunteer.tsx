import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ModalLayout from '../layouts/ModalLayout';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import VolunteerForm, { VolunteerFormTypes, volunteerSchema } from '../components/VolunteerForm';
import { useVolunteer } from '../store/volunteer/volunteer.selector';
import { useUpdateVolunteerProfileMutation } from '../services/volunteer/volunteer.service';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';

const EditVolunteer = ({ navigation }: any) => {
  console.log('EditVolunteer');
  const { t } = useTranslation('volunteer');
  const { volunteer } = useVolunteer();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VolunteerFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(volunteerSchema) as any,
  });

  const { isLoading: isUpdateingProfile, mutate: updateVolunteerProfile } =
    useUpdateVolunteerProfileMutation();

  useEffect(() => {
    if (volunteer) {
      reset({
        email: volunteer?.profile.email,
        phone: volunteer?.user.phone,
        branchId: volunteer?.profile.branch?.id,
        departmentId: volunteer?.profile.department?.id,
        roleId: volunteer?.profile.role?.id,
        activeSince: volunteer?.profile.activeSince
          ? new Date(volunteer.profile.activeSince)
          : undefined,
      });
    }
  }, [volunteer, reset]);

  const onSubmit = (profile: VolunteerFormTypes) => {
    updateVolunteerProfile(
      {
        profile: {
          ...profile,
          roleId: profile.roleId || undefined,
          departmentId: profile.departmentId || undefined,
          branchId: profile.branchId || undefined,
        },
        volunteerId: volunteer?.id as string,
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
        onSuccess: () => navigation.goBack(),
      },
    );
  };

  return (
    <ModalLayout
      title={t('edit')}
      onDismiss={navigation.goBack}
      actionsOptions={{
        onActionButtonClick: handleSubmit(onSubmit),
        actionLabel: t('general:save'),
        loading: isUpdateingProfile,
      }}
    >
      <VolunteerForm
        paragraph={''}
        isLoading={isUpdateingProfile}
        control={control}
        errors={errors}
      />
    </ModalLayout>
  );
};

export default EditVolunteer;
