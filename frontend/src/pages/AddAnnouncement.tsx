import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { AnnouncementType } from '../common/enums/announcement-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import AnnouncementForm, { AnnouncementFormTypes } from '../components/AnnouncementForm';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import { useCreateAnnouncementMutation } from '../services/announcement/announcement.service';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export const anouncementFormValidationSchema = yup.object({
  name: yup
    .string()
    .required(`${i18n.t('announcement:form.name.required')}`)
    .min(2, `${i18n.t('announcement:form.name.min', { value: '2' })}`)
    .max(30, `${i18n.t('announcement:form.name.max', { value: '30' })}`),
  description: yup
    .string()
    .required(`${i18n.t('announcement:form.description.required')}`)
    .min(2, `${i18n.t('announcement:form.description.min', { value: '2' })}`)
    .max(225, `${i18n.t('announcement:form.description.max', { value: '225' })}`),
  type: yup
    .mixed<AnnouncementType>()
    .oneOf(Object.values(AnnouncementType))
    .required(`${i18n.t('announcement:form.type.required')}`),
  volunteersNeeded: yup
    .number()
    .nullable()
    .transform((value, original) => (original === '' || original === null ? null : value))
    .integer(`${i18n.t('announcement:form.volunteers_needed.integer')}`)
    .min(1, `${i18n.t('announcement:form.volunteers_needed.min', { value: '1' })}`),
  displayStartDate: yup
    .date()
    .typeError(`${i18n.t('announcement:form.display_start_date.required')}`)
    .required(`${i18n.t('announcement:form.display_start_date.required')}`),
  displayEndDate: yup
    .date()
    .nullable()
    .when('displayStartDate', ([displayStartDate], schema) =>
      displayStartDate
        ? schema.min(
            yup.ref('displayStartDate'),
            `${i18n.t('announcement:form.display_end_date.min')}`,
          )
        : schema,
    ),
  publishNow: yup.boolean(),
});

const AddAnnouncement = () => {
  const navigate = useNavigate();

  const { mutateAsync: createAnnouncement, isLoading } = useCreateAnnouncementMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AnnouncementFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(anouncementFormValidationSchema),
    defaultValues: {
      type: AnnouncementType.RECRUITMENT,
      displayStartDate: new Date(),
      publishNow: true,
    },
  });

  const onBackButtonPress = () => {
    navigate('/announcements', { replace: true });
  };

  const onSubmit = (formValues: AnnouncementFormTypes) => {
    createAnnouncement(formValues, {
      onSuccess: () => {
        useSuccessToast(
          formValues.publishNow
            ? i18n.t('announcement:submit.messages.activate')
            : i18n.t('announcement:submit.messages.create'),
        );
        onBackButtonPress();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <Card>
          <CardHeader>
            <h4 className="text-sm sm:text-xl">{i18n.t('announcement:form.title')}</h4>
            <div className="flex flex-row gap-4">
              <Button
                label={i18n.t('announcement:actions.create')}
                icon={<PaperAirplaneIcon className="h-5 w-5" />}
                className="btn-primary"
                onClick={handleSubmit(onSubmit)}
              />
            </div>
          </CardHeader>
          <CardBody>
            <AnnouncementForm control={control} errors={errors} />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default AddAnnouncement;
