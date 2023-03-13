import { BookmarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import AnnouncementForm, { AnnouncementFormTypes } from '../components/AnnouncementForm';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
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
    formState: { errors },
    reset,
  } = useForm<AnnouncementFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(anouncementFormValidationSchema),
  });

  useEffect(() => {
    if (announcement) {
      const { targets, ...anouncementFormData } = announcement;
      reset({
        name: anouncementFormData.name,
        description: anouncementFormData.description,
        ...(targets ? { targets: targets.map(mapDivisionListItemToSelectItem) } : {}),
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
    navigate('/announcements', { replace: true });
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
            useSuccessToast(
              formValues.status === AnnouncementStatus.DRAFT
                ? i18n.t('announcement:submit.messages.draft')
                : i18n.t('announcement:submit.messages.publish'),
            );
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

  const onSaveDraft = (formValues: AnnouncementFormTypes) => {
    onSubmit({ ...formValues, status: AnnouncementStatus.DRAFT });
  };

  const onPublish = (formValues: AnnouncementFormTypes) => {
    onSubmit({ ...formValues, status: AnnouncementStatus.PUBLISHED });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>
        {i18n.t('general:edit', { item: i18n.t('announcement:name') })}
      </PageHeader>
      {isAnnouncementLoading && isUpdateAnnouncementLoading && <LoadingContent />}
      {!isUpdateAnnouncementLoading && !isAnnouncementLoading && (
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
      {!announcement && !isAnnouncementLoading && !isUpdateAnnouncementLoading && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
    </PageLayout>
  );
};

export default EditAnnouncement;
