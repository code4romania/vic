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

const EditActivityLog = ({ navigation }: any) => {
  console.log('EditActivityLog');
  const { t } = useTranslation();
  const { selectedActivityLog } = useActivityLogs();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ActivityLogFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(activityLogSchema),
  });

  useEffect(() => {
    if (selectedActivityLog) {
      reset({
        // branchId: volunteer?.profile.branch?.id,
        date: new Date(),
        hours: selectedActivityLog.hours.toString(),
        mentions: selectedActivityLog.mentions,
        eventId: selectedActivityLog.event?.id,
        activityTypeId: selectedActivityLog.activityType.id,
      });
    }
  }, [selectedActivityLog, reset]);

  const onSubmit = (activityLog: ActivityLogFormTypes) => {
    console.log('log, ', activityLog);
  };

  return (
    <ModalLayout
      title={t('general:edit', { item: '' })}
      onDismiss={navigation.goBack}
      actionsOptions={{
        actionLabel: t('general:save'),
        onActionButtonClick: handleSubmit(onSubmit),
        loading: false,
      }}
    >
      <ActivityLogForm isLoading={false} control={control} errors={errors} />
    </ModalLayout>
  );
};

export default EditActivityLog;
