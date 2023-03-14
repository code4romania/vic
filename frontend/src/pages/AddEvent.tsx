import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import * as yup from 'yup';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import Button from '../components/Button';
import { BookmarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import LoadingContent from '../components/LoadingContent';
import EventForm, { EventFormTypes, TargetType } from '../components/EventForm';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAddEventMutation } from '../services/event/event.service';
// import { useErrorToast, useSuccessToast } from '../hooks/useToast';
// import { InternalErrors } from '../common/errors/internal-errors.class';
import { EventStatus } from '../common/enums/event-status';
import { AttendanceType } from '../common/enums/attendance-type.enum';

const validationSchema = yup.object({
  name: yup
    .string()
    .required(`${i18n.t('division:form.name.required')}`)
    .min(2, `${i18n.t('division:form.name.min', { value: '2' })}`)
    .max(50, `${i18n.t('division:form.name.max', { value: '50' })}`),
  startDate: yup
    .date()
    .required(`${i18n.t('access_code:form.start_date.required')}`)
    .typeError(`${i18n.t('general:invalid_date')}`),
  endDate: yup.date().typeError(`${i18n.t('general:invalid_date')}`),
  location: yup
    .string()
    .min(2, `${i18n.t('events:form.location.min', { value: '2' })}`)
    .max(300, `${i18n.t('events:form.location.max', { value: '300' })}`),
  description: yup
    .string()
    .required(`${i18n.t('organization:form.description.required')}`)
    .min(2, `${i18n.t('organization:form.description.min', { value: '2' })}`)
    .max(1500, `${i18n.t('organization:form.description.max', { value: '1500' })}`),
  targetType: yup.string().required(),
  targets: yup.array().when('targetType', {
    is: TargetType.SELECT,
    then: yup.array().required(`${i18n.t('events:form.target.required')}`),
  }),
  logo: yup.string().optional(),
  attendanceType: yup.string().oneOf(Object.values(AttendanceType)),
  attendanceMention: yup
    .string()
    .min(2, `${i18n.t('events:form.mention.min', { value: '2' })}`)
    .max(250, `${i18n.t('events:form.mention.max', { value: '250' })}`)
    .when('attendanceType', {
      is: AttendanceType.MENTION,
      then: yup.string().required(`${i18n.t('events:form.mention.required')}`),
    }),
  tasks: yup.array().required(`${i18n.t('events:form.task.required')}`),
  observation: yup
    .string()
    .min(2, `${i18n.t('events:form.observation.min', { value: '2' })}`)
    .max(1500, `${i18n.t('events:form.observation.max', { value: '1500' })}`),
});

const AddEvent = () => {
  const navigate = useNavigate();
  // const { mutateAsync: addEvent, isLoading: isAddEventLoading } = useAddEventMutation();
  const { isLoading: isAddEventLoading } = useAddEventMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    resetField,
  } = useForm<EventFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      targetType: TargetType.PUBLIC,
      attendanceType: AttendanceType.SIMPLE,
    },
  });

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const submitValues = (data: EventFormTypes, status: EventStatus) => {
    console.log('submit', data);
    console.log('status', status);
    // addEvent(
    //   {
    //     ...data,
    //   },
    //   {
    //     onSuccess: () => {
    //       useSuccessToast(i18n.t(`events:form.submit.${status}`));
    //       navigateBack();
    //     },
    //     onError: (error) => {
    //       useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
    //     },
    //   },
    // );
  };

  useEffect(() => {
    console.log('errors', errors);
  }, [errors]);

  const onSaveAsDraft = (data: EventFormTypes) => {
    submitValues(data, EventStatus.DRAFT);
  };

  const onPublish = (data: EventFormTypes) => {
    submitValues(data, EventStatus.PUBLISHED);
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isAddEventLoading && <LoadingContent />}
      {!isAddEventLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('general:event')}</h2>
            <div className="flex flex-row gap-2 sm:gap-4">
              <Button
                className="btn-outline-secondary"
                label={i18n.t('general:save_draft')}
                icon={<BookmarkIcon className="h-5 w-5 text-cool-gray-500 sm:hidden" />}
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
            <EventForm control={control} errors={errors} watch={watch} resetField={resetField} />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default AddEvent;
