import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
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

const validationSchema = yup.object({
  name: yup
    .string()
    .required(`${i18n.t('announcement:form.name.required')}`)
    .min(2, `${i18n.t('announcement:form.name.min', { value: '20' })}`)
    .max(30, `${i18n.t('announcement:form.name.max', { value: '30' })}`),
  description: yup
    .string()
    .required(`${i18n.t('announcement:form.description.required')}`)
    .min(2, `${i18n.t('announcement:form.description.min', { value: '2' })}`)
    .max(1000, `${i18n.t('announcement:form.description.max', { value: '1000' })}`),
  targets: yup.array().optional(),
});

const AddAnnouncement = () => {
  const navigate = useNavigate();

  const { mutateAsync: createAnnouncement, isLoading } = useCreateAnnouncementMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    resetField,
    register,
  } = useForm<AnnouncementFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const onNavigateBack = () => {
    navigate('/announcements', { replace: true });
  };

  const onSaveDraft = (formValues: AnnouncementFormTypes) => {
    const targetsIds = formValues.targets ? formValues.targets.map((target) => target.value) : [];
    createAnnouncement(
      {
        name: formValues.name,
        description: formValues.description,
        status: AnnouncementStatus.DRAFT,
        targetsIds,
      },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('announcement:success.create_draft'));
          onNavigateBack();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
          );
        },
      },
    );
  };

  const onPublish = (formValues: AnnouncementFormTypes) => {
    const targetsIds = formValues.targets ? formValues.targets.map((target) => target.value) : [];
    createAnnouncement(
      {
        name: formValues.name,
        description: formValues.description,
        status: AnnouncementStatus.PUBLISHED,
        targetsIds,
      },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('announcement:success.create_publish'));
          onNavigateBack();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
          );
        },
      },
    );
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onNavigateBack}>
        {i18n.t('general:add', { item: i18n.t('announcement:name') })}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <Card>
          <CardHeader>
            <h4 className="text-sm sm:text-xl">{i18n.t('announcement:form.title')}</h4>
            <div className="flex flex-row gap-4">
              <Button
                label={i18n.t('announcement:save_draft')}
                className="btn-outline-secondary"
                onClick={handleSubmit(onSaveDraft)}
              />
              <Button
                label={i18n.t('general:send')}
                className="btn-primary"
                onClick={handleSubmit(onPublish)}
              />
            </div>
          </CardHeader>
          <CardBody>
            <AnnouncementForm
              control={control}
              errors={errors}
              resetField={resetField}
              register={register}
            />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default AddAnnouncement;
