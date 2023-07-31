import React, { useEffect } from 'react';
import ModalLayout from '../layouts/ModalLayout';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';
import { useTranslation } from 'react-i18next';
import ActivityLogForm, {
  ActivityLogFormTypes,
  activityLogSchema,
} from '../components/ActivityLogForm';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateActivityLog } from '../services/activity-log/activity-log.service';
import { parse } from 'date-fns';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { CONSTANTS } from '../common/constants/constants';

const EditActivityLog = ({ navigation }: any) => {
  console.log('EditActivityLog');
  const { t } = useTranslation();
  const { selectedActivityLog } = useActivityLogs();

  // log hours mutation
  const { mutate: updateHouts, isLoading: isUpdateingHours } = useUpdateActivityLog();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ActivityLogFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(activityLogSchema) as any,
  });

  useEffect(() => {
    if (selectedActivityLog) {
      reset({
        date: parse(selectedActivityLog.date, 'dd.MM.y', new Date()),
        hours: selectedActivityLog.hours.toString(),
        mentions: selectedActivityLog.mentions,
        eventId: selectedActivityLog.event?.id,
        activityTypeId: selectedActivityLog.activityType?.id || CONSTANTS.OTHER_OPTION,
      });
    }
  }, [selectedActivityLog, reset]);

  const onSubmit = (activityLog: ActivityLogFormTypes) => {
    if (selectedActivityLog) {
      updateHouts(
        {
          volunteerId: selectedActivityLog?.id,
          activityLog,
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
    }
  };

  return (
    <ModalLayout
      title={t('general:edit', { item: '' })}
      onDismiss={navigation.goBack}
      actionsOptions={{
        actionLabel: t('general:save'),
        onActionButtonClick: handleSubmit(onSubmit),
        loading: isUpdateingHours,
      }}
    >
      <ActivityLogForm isLoading={false} control={control} errors={errors} />
    </ModalLayout>
  );
};

export default EditActivityLog;
