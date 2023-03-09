import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import * as yup from 'yup';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import Button from '../components/Button';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import LoadingContent from '../components/LoadingContent';
import EventForm, { AttendanceType, EventFormTypes, TargetType } from '../components/EventForm';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { mapItemToMultiListItem } from '../components/MultiSelect';
import { useActivityTypesQuery } from '../services/activity-type/activity-type.service';
import { useEditEventMutation, useEventQuery } from '../services/event/event.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';

const validationSchema = yup.object({
  name: yup
    .string()
    .required(`${i18n.t('division:form.name.required')}`)
    .min(2, `${i18n.t('division:form.name.min', { value: '2' })}`)
    .max(50, `${i18n.t('division:form.name.max', { value: '50' })}`),
  startDate: yup.date().required(`${i18n.t('access_code:form.start_date.required')}`),
  location: yup
    .string()
    .min(2, `${i18n.t('events:form.location.min', { value: '2' })}`)
    .max(500, `${i18n.t('events:form.location.max', { value: '500' })}`),
  description: yup
    .string()
    .required(`${i18n.t('organization:form.description.required')}`)
    .min(2, `${i18n.t('organization:form.description.min', { value: '2' })}`)
    .max(1500, `${i18n.t('organization:form.description.max', { value: '1500' })}`),
  targetsIds: yup.array(),
  attendanceType: yup.string().oneOf(Object.values(AttendanceType)),
  attendanceMention: yup
    .string()
    .min(2, `${i18n.t('events:form.mention.min', { value: '2' })}`)
    .max(1500, `${i18n.t('events:form.mention.max', { value: '1500' })}`),
  observation: yup
    .string()
    .min(2, `${i18n.t('events:form.observation.min', { value: '2' })}`)
    .max(1500, `${i18n.t('events:form.observation.max', { value: '1500' })}`),
  tasksIds: yup.array().required(`${i18n.t('events:form.task.required')}`),
});

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: event } = useEventQuery(id as string);
  const { data: activityTypes, isLoading: isActivityTypesLoading } = useActivityTypesQuery();
  const { mutateAsync: editEvent, isLoading: isEditEventLoading } = useEditEventMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EventFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const onSaveChanges = (data: EventFormTypes) => {
    if (event)
      editEvent(
        {
          id: event.id,
          data: {
            ...data,
            isPublic: data.isPublic === TargetType.PUBLIC,
            targetsIds: data.targetsIds.map((target) => target.value),
            tasksIds: data.tasksIds.map((task) => task.value),
          },
        },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('events:form.submit.edit'));
            navigateBack();
          },
          onError: (error) => {
            useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
          },
        },
      );
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:edit', { item: '' })}
      </PageHeader>
      {isActivityTypesLoading && isEditEventLoading && <LoadingContent />}
      {!isActivityTypesLoading && !isEditEventLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('general:event')}</h2>
            <Button
              className="btn-primary"
              label={i18n.t('general:save_changes')}
              icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
              onClick={handleSubmit(onSaveChanges)}
            />
          </CardHeader>
          <CardBody>
            {activityTypes && (
              <EventForm
                control={control}
                errors={errors}
                taskOpitons={activityTypes.map(mapItemToMultiListItem)}
                event={event}
                reset={reset}
                disabled={true}
              />
            )}
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default EditEvent;
