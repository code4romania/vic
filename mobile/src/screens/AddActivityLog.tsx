import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import { useTranslation } from 'react-i18next';
import { useCreateActivityLogMutation } from '../services/activity-log/activity-log.service';
import ActivityLogForm, {
  ActivityLogFormTypes,
  activityLogSchema,
} from '../components/ActivityLogForm';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';

const AddActivityLog = ({ navigation }: any) => {
  console.log('AddActivityLog');
  // translations
  const { t } = useTranslation('activity_log');
  // the active organization
  const { activeOrganization } = useActiveOrganization();
  // log hours mutation
  const { mutate: logHours, isLoading: isLoggingHours } = useCreateActivityLogMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityLogFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(activityLogSchema),
  });

  const onSubmit = (activityLog: ActivityLogFormTypes) => {
    logHours(
      {
        activityLog: {
          ...activityLog,
          volunteerId: activeOrganization?.volunteerId,
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
      title={i18n.t('general:add', { item: t('title').toLowerCase() })}
      onDismiss={navigation.goBack}
      actionsOptions={{
        actionLabel: i18n.t('general:add', { item: '' }),
        onActionButtonClick: handleSubmit(onSubmit),
        loading: isLoggingHours,
      }}
    >
      <ActivityLogForm isLoading={isLoggingHours} control={control} errors={errors} />
    </ModalLayout>
  );
};

export default AddActivityLog;
