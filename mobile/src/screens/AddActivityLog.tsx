import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useCreateActivityLogMutation } from '../services/activity-log/activity-log.service';
import ActivityLogForm, {
  ActivityLogFormTypes,
  activityLogSchema,
} from '../components/ActivityLogForm';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useUserProfile } from '../store/profile/profile.selector';

const AddActivityLog = ({ navigation }: any) => {
  // translations
  const { t } = useTranslation('activity_log');
  // the active organization
  const { userProfile } = useUserProfile();
  // log hours mutation
  const { mutate: logHours, isLoading: isLoggingHours } = useCreateActivityLogMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityLogFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(activityLogSchema) as any,
  });

  const onSubmit = (activityLog: ActivityLogFormTypes) => {
    logHours(
      {
        activityLog: {
          ...activityLog,
          volunteerId: userProfile?.activeOrganization?.volunteerId,
        },
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.ACTIVITY_LOG_ERRORS.getError(
              error.response?.data.code_error,
            )}`,
          });
        },
      },
    );
  };

  return (
    <ModalLayout
      title={t('add_title')}
      onDismiss={navigation.goBack}
      actionsOptions={{
        actionLabel: t('general:add', { item: '' }),
        onActionButtonClick: handleSubmit(onSubmit),
        loading: isLoggingHours,
      }}
    >
      <ActivityLogForm isLoading={isLoggingHours} control={control} errors={errors} />
    </ModalLayout>
  );
};

export default AddActivityLog;
