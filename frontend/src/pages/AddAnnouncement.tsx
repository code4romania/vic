import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { BookmarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

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
  targets: yup.array().optional(),
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
  });

  const onBackButtonPress = () => {
    navigate('/announcements', { replace: true });
  };

  const onSubmit = (formValues: AnnouncementFormTypes) => {
    createAnnouncement(formValues, {
      onSuccess: () => {
        useSuccessToast(
          formValues.status === AnnouncementStatus.DRAFT
            ? i18n.t('announcement:submit.messages.draft')
            : i18n.t('announcement:submit.messages.publish'),
        );
        onBackButtonPress();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onSaveDraft = (formValues: AnnouncementFormTypes) => {
    onSubmit({ ...formValues, status: AnnouncementStatus.DRAFT });
  };

  const onPublish = (formValues: AnnouncementFormTypes) => {
    onSubmit({ ...formValues, status: AnnouncementStatus.PUBLISHED });
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
                label={i18n.t('general:save_draft')}
                icon={<BookmarkIcon className="h-5 w-5" />}
                className="btn-outline-secondary"
                onClick={handleSubmit(onSaveDraft)}
              />
              <Button
                label={i18n.t('general:send')}
                icon={<PaperAirplaneIcon className="h-5 w-5" />}
                className="btn-primary"
                onClick={handleSubmit(onPublish)}
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
