import React from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import * as yup from 'yup';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import Button from '../components/Button';
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import LoadingContent from '../components/LoadingContent';
import EventForm, { AttendanceType, EventFormTypes, TargetType } from '../components/EventForm';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDivisionsListItemsQuery } from '../services/division/division.service';
import { mapItemToMultiListItem } from '../components/MultiSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { useActivityTypesQuery } from '../services/activity-type/activity-type.service';
import { useAddEventMutation } from '../services/event/event.service';
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

const AddEvent = () => {
  const navigate = useNavigate();

  const { data: divisionListItems, isLoading: isDivisionListItemsLoading } =
    useDivisionsListItemsQuery(DivisionType.DEPARTMENT);
  const { data: activityTypes, isLoading: isActivityTypesLoading } = useActivityTypesQuery();
  const { mutateAsync: addEvent, isLoading: isAddEventLoading } = useAddEventMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EventFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      logo: '',
      isPublic: TargetType.PUBLIC,
      attendanceType: AttendanceType.SIMPLE,
    },
  });

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const submitValues = (data: EventFormTypes, status: 'published' | 'draft') => {
    addEvent(
      {
        ...data,
        isPublic: data.isPublic === TargetType.PUBLIC,
        targetsIds:
          data.isPublic === TargetType.SELECT ? data.targetsIds.map((target) => target.value) : [],
        tasksIds: data.tasksIds.map((task) => task.value),
        status,
      },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('activity_types:form.submit.add'));
          navigateBack();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
        },
      },
    );
  };

  const onSaveAsDraft = (data: EventFormTypes) => {
    submitValues(data, 'draft');
  };

  const onPublish = (data: EventFormTypes) => {
    submitValues(data, 'published');
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isDivisionListItemsLoading && isActivityTypesLoading && isAddEventLoading && (
        <LoadingContent />
      )}
      {!isDivisionListItemsLoading && !isActivityTypesLoading && !isAddEventLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('general:event')}</h2>
            <div className="flex flex-row gap-2 sm:gap-4">
              <Button
                className="btn-outline-secondary"
                label={i18n.t('general:save_as_draft')}
                icon={<DocumentIcon className="h-5 w-5 text-cool-gray-500 sm:hidden" />}
                onClick={handleSubmit(onSaveAsDraft)}
              />
              <Button
                className="btn-primary"
                label={i18n.t('general:publish')}
                icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
                onClick={handleSubmit(onPublish)}
              />
            </div>
          </CardHeader>
          <CardBody>
            {divisionListItems && activityTypes && (
              <EventForm
                control={control}
                errors={errors}
                targetOptions={divisionListItems.map(mapItemToMultiListItem)}
                taskOpitons={activityTypes.map(mapItemToMultiListItem)}
              />
            )}
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default AddEvent;
