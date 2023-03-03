import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import { DivisionType } from '../common/enums/division-type.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import AnnouncementForm, { AnnouncementFormTypes } from '../components/AnnouncementForm';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import { mapItemToMultiListItem } from '../components/MultiSelect';
import PageHeader from '../components/PageHeader';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useAnnouncementQuery,
  useUpdateAnnouncementMutation,
} from '../services/announcement/announcement.service';
import { useDivisionsListItemsQuery } from '../services/division/division.service';

const validationSchema = yup.object({
  name: yup
    .string()
    .required(`${i18n.t('announcement:form.name.required')}`)
    .min(2, `${i18n.t('announcement:form.name.min', { value: '2' })}`)
    .max(30, `${i18n.t('announcement:form.name.max', { value: '30' })}`),
  description: yup
    .string()
    .required(`${i18n.t('announcement:form.description.required')}`)
    .min(2, `${i18n.t('announcement:form.description.min', { value: '2' })}`)
    .max(1000, `${i18n.t('announcement:form.description.max', { value: '1000' })}`),
  targets: yup.array().optional(),
});

const EditAnnouncement = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: announcement,
    isLoading: isAnnouncementLoading,
    error: announcementError,
  } = useAnnouncementQuery(id as string);
  const { data: divisionListItems, isLoading: isDivisionListItemsLoading } =
    useDivisionsListItemsQuery(DivisionType.DEPARTMENT);
  const { mutateAsync: updateAnnouncement, isLoading: isUpdateAnnouncementLoading } =
    useUpdateAnnouncementMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    resetField,
    watch,
  } = useForm<AnnouncementFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (announcement) {
      reset({
        name: announcement.name,
        description: announcement.description,
        targets: announcement.targets.map(mapItemToMultiListItem),
        isAllOrganization: announcement.targets ? false : true,
      });
    }
  }, [announcement]);

  useEffect(() => {
    if (announcementError)
      useErrorToast(
        InternalErrors.ANNOUNCEMENT_ERRORS.getError(announcementError.response?.data.code_error),
      );
  }, [announcementError]);

  const onNavigateBack = () => {
    navigate('/announcements', { replace: true });
  };

  const onSaveDraft = (formValues: AnnouncementFormTypes) => {
    if (announcement) {
      const targetsIds = !formValues.isAllOrganization
        ? formValues.targets.map((target) => target.value)
        : [];
      updateAnnouncement(
        {
          id: announcement.id,
          updateData: {
            name: formValues.name,
            description: formValues.description,
            status: AnnouncementStatus.DRAFT,
            targetsIds,
          },
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
    }
  };

  const onPublish = (formValues: AnnouncementFormTypes) => {
    if (announcement) {
      const targetsIds = !formValues.isAllOrganization
        ? formValues.targets.map((target) => target.value)
        : [];
      updateAnnouncement(
        {
          id: announcement?.id,
          updateData: {
            name: formValues.name,
            description: formValues.description,
            status: AnnouncementStatus.PUBLISHED,
            targetsIds,
          },
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
    }
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onNavigateBack}>
        {i18n.t('general:edit', { item: i18n.t('announcement:name') })}
      </PageHeader>
      {isAnnouncementLoading && isUpdateAnnouncementLoading && isDivisionListItemsLoading && (
        <LoadingContent />
      )}
      {!isUpdateAnnouncementLoading && !isAnnouncementLoading && !isDivisionListItemsLoading && (
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
              options={divisionListItems?.map(mapItemToMultiListItem)}
              control={control}
              errors={errors}
              resetField={resetField}
              watch={watch}
            />
          </CardBody>
        </Card>
      )}
      {!announcement &&
        !isAnnouncementLoading &&
        !isUpdateAnnouncementLoading &&
        !isDivisionListItemsLoading && (
          <EmptyContent description={i18n.t('general:error.load_entries')} />
        )}
    </PageLayout>
  );
};

export default EditAnnouncement;
