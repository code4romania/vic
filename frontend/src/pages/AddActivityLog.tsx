import React, { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import ActivityLogForm, { ActivityLogFormTypes } from '../components/ActivityLogForm';
import { useAddActivityLogMutation } from '../services/activity-log/activity-log.service';
import { AddActivityLogProps } from '../containers/query/AddActivityLogWithQueryParams';

export const activityLogValidationSchema = yup
  .object({
    volunteer: yup
      .object()
      .shape({
        label: yup.string().required(`${i18n.t('activity_log:form.volunteer.required')}`),
        value: yup.string().required(`${i18n.t('activity_log:form.volunteer.required')}`),
      })
      .required(`${i18n.t('activity_log:form.volunteer.required')}`),
    task: yup
      .object()
      .shape({
        label: yup.string().required(`${i18n.t('activity_log:form.task.required')}`),
        value: yup.string().required(`${i18n.t('activity_log:form.task.required')}`),
      })
      .required(`${i18n.t('activity_log:form.task.required')}`),
    hours: yup
      .number()
      .typeError(`${i18n.t('activity_log:form.hours.required')}`)
      .integer(`${i18n.t('activity_log:form.hours.integer')}`)
      .min(1, `${i18n.t('activity_log:form.hours.min')}`)
      .max(300, `${i18n.t('activity_log:form.hours.max', { value: 300 })}`)
      .required(`${i18n.t('activity_log:form.hours.required')}`),
    date: yup
      .date()
      .required(`${i18n.t('activity_log:form.date.required')}`)
      .typeError(`${i18n.t('general:invalid_date')}`),
    mentions: yup.string().max(300, `${i18n.t('events:form.mention.max', { value: '300' })}`),
  })
  .required();

const AddActivityLog = ({ query }: AddActivityLogProps) => {
  const navigate = useNavigate();

  const { mutateAsync: addActivityLog, isLoading: isAddingActivityLog } =
    useAddActivityLogMutation();

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

  const navigateBack = () => {
    navigate('/activity-log', { replace: true });
  };

  useEffect(() => {
    if (query.volunteerName && query.volunteerId) {
      reset({ volunteer: { value: query.volunteerId, label: query.volunteerName } });
    }
  }, []);

  const onSubmit = (data: ActivityLogFormTypes) => {
    addActivityLog(data, {
      onSuccess: () => {
        useSuccessToast(i18n.t('activity_log:form.submit.messages.add'));
        navigateBack();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.ACTIVITY_LOG_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isAddingActivityLog && <LoadingContent />}
      {!isAddingActivityLog && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('side_menu:options.activity_log')}</h2>
            <Button
              label={i18n.t('general:save')}
              className="btn-primary"
              icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <ActivityLogForm control={control} errors={errors} lockVoluneer={!!query.volunteerId} />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default AddActivityLog;
