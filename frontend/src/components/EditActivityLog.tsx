import React, { useEffect } from 'react';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import { IActivityLog } from '../common/interfaces/activity-log.interface';
import { activityLogValidationSchema } from '../pages/AddActivityLog';
import ActivityLogForm from './ActivityLogForm';
import Button from './Button';
import LoadingContent from './LoadingContent';
import { mapUserToListItem } from '../common/utils/utils';
import SidePanel from './SidePanel';
import { useForm } from 'react-hook-form';
import { ActivityLogFormTypes } from '../components/ActivityLogForm';

interface EditActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ActivityLogFormTypes) => void;
  activityLog: IActivityLog | undefined;
  isEditActivitiyLoading: boolean;
}

const EditActivityLog = ({
  isOpen,
  onClose,
  onSave,
  activityLog,
  isEditActivitiyLoading,
}: EditActivityLogProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ActivityLogFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(activityLogValidationSchema),
  });

  useEffect(() => {
    // init form data
    if (activityLog)
      reset({
        date: new Date(activityLog.date),
        hours: activityLog.hours,
        mentions: activityLog.mentions,
        volunteer: mapUserToListItem(activityLog.volunteer),
        task: mapUserToListItem(activityLog.activityType),
        event: activityLog.event ? mapUserToListItem(activityLog.event) : undefined,
      });
  }, [activityLog]);

  return (
    <SidePanel isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center gap-1 text-center sm:text-left px-6">
        <button
          className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
          onClick={onClose}
          aria-label="close-modal"
          type="button"
        >
          <ArrowLongLeftIcon className="h-6 w-6" />
        </button>
        <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
          {i18n.t('activity_log:side_panel.title')}
        </h3>
      </div>
      {!activityLog && isEditActivitiyLoading && <LoadingContent />}
      {activityLog && !isEditActivitiyLoading && (
        <>
          <div className="grow flex flex-col gap-6 pb-24 overflow-y-auto">
            <ActivityLogForm control={control} errors={errors} disabled />
          </div>
          <footer className="p-6 flex flex-row-reverse gap-4 border-t w-full  fixed bottom-0 right-0 bg-white">
            <Button
              label={i18n.t('general:save')}
              className="btn-outline-secondary"
              onClick={handleSubmit(onSave)}
              aria-label={`${i18n.t('general:save')}`}
              type="button"
            />
          </footer>
        </>
      )}
    </SidePanel>
  );
};

export default EditActivityLog;
