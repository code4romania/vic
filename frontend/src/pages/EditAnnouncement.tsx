import { CheckIcon } from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import AnnouncementForm, { AnnouncementFormTypes } from '../components/AnnouncementForm';
import AnnouncementFormCard from '../components/AnnouncementFormCard';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import {
  useAnnouncement,
  useUpdateAnnouncementMutation,
} from '../services/announcement/announcement.service';
import { anouncementFormValidationSchema } from './AddAnnouncement';

const EditAnnouncement = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: announcement,
    isLoading: isAnnouncementLoading,
    error: announcementError,
  } = useAnnouncement(id as string);

  const { mutateAsync: updateAnnouncement, isLoading: isUpdateAnnouncementLoading } =
    useUpdateAnnouncementMutation();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(anouncementFormValidationSchema),
  });

  useEffect(() => {
    if (announcement) {
      reset({
        name: announcement.name,
        description: announcement.description,
        type: announcement.type,
        volunteersNeeded: announcement.volunteersNeeded ?? null,
        displayStartDate: new Date(announcement.displayStartDate),
        displayEndDate: announcement.displayEndDate ? new Date(announcement.displayEndDate) : null,
      });
    }
  }, [announcement]);

  useEffect(() => {
    if (announcementError)
      useErrorToast(
        InternalErrors.ANNOUNCEMENT_ERRORS.getError(announcementError.response?.data.code_error),
      );
  }, [announcementError]);

  const onBackButtonPress = () => {
    navigate(id ? `/announcements/${id}` : '/announcements', { replace: true });
  };

  const onSubmit = (formValues: AnnouncementFormTypes) => {
    if (announcement) {
      updateAnnouncement(
        {
          id: announcement?.id,
          updateData: formValues,
        },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('announcement:submit.messages.edit'));
            onBackButtonPress();
          },
          onError: (error) => {
            useErrorToast(
              InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
            );
          },
        },
      );
    }
  };

  const isLoading = isAnnouncementLoading || isUpdateAnnouncementLoading;

  return (
    <PageLayout>
      <PageHeader
        onBackButtonPress={onBackButtonPress}
        subtitle={announcement?.name ?? `${i18n.t('announcement:page.subtitle')}`}
      >
        {i18n.t('announcement:page.title')}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && announcement && (
        <AnnouncementFormCard
          title={i18n.t('announcement:edit.title')}
          subtitle={i18n.t('announcement:edit.subtitle')}
          submitLabel={i18n.t('general:save_changes')}
          submitIcon={<CheckIcon className="h-5 w-5" />}
          onCancel={onBackButtonPress}
          onSubmit={handleSubmit(onSubmit)}
        >
          <AnnouncementForm control={control} errors={errors} isEditForm />
        </AnnouncementFormCard>
      )}
      {!announcement && !isLoading && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
    </PageLayout>
  );
};

export default EditAnnouncement;
