import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import Button from '../components/Button';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import LoadingContent from '../components/LoadingContent';
import EventForm, { EventFormTypes, TargetType } from '../components/EventForm';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEditEventMutation, useEventQuery } from '../services/event/event.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { eventValidationSchema } from './AddEvent';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: event } = useEventQuery(id as string);
  const { mutateAsync: editEvent, isLoading: isEditEventLoading } = useEditEventMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    resetField,
    reset,
  } = useForm<EventFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(eventValidationSchema),
  });

  useEffect(() => {
    // init form data
    if (event)
      reset({
        attendanceType: event.attendanceType,
        attendanceMention: event.attendanceMention || undefined,
        observation: event.observation || undefined,
        name: event.name,
        location: event.location || undefined,
        description: event.description,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : undefined,
        targetType: event.isPublic
          ? TargetType.PUBLIC
          : event.targets?.length > 0
          ? TargetType.SELECT
          : TargetType.ALL,
        targets: !event.isPublic ? [...event.targets.map(mapDivisionListItemToSelectItem)] : [],
        tasks: [...event.tasks.map(mapDivisionListItemToSelectItem)],
        status: event.status,
      });
  }, [event]);

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const onSaveChanges = (data: EventFormTypes) => {
    if (event)
      editEvent(
        {
          id: event.id,
          data,
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
      {isEditEventLoading && <LoadingContent />}
      {!isEditEventLoading && (
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
            <EventForm
              control={control}
              errors={errors}
              watch={watch}
              resetField={resetField}
              isEditForm
              eventStatus={event?.status}
            />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default EditEvent;
