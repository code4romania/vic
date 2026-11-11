import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { PlusIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { AnnouncementType } from '../common/enums/announcement-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IAnnouncement } from '../common/interfaces/announcement.interface';
import AnnouncementForm, { AnnouncementFormTypes } from '../components/AnnouncementForm';
import AnnouncementFormCard from '../components/AnnouncementFormCard';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { useCreateAnnouncementMutation } from '../services/announcement/announcement.service';
import { useValidationGate } from '../hooks/useValidationGate';

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

// "Duplică" from the list opens this page with the original in the router state: the copy
// keeps its content and starts showing today.
const defaultValuesFor = (original?: IAnnouncement): Partial<AnnouncementFormTypes> =>
  original
    ? {
        name: original.name,
        description: original.description,
        type: original.type,
        volunteersNeeded: original.volunteersNeeded ?? null,
        displayStartDate: new Date(),
        displayEndDate: null,
        publishNow: false,
      }
    : { type: AnnouncementType.RECRUITMENT, displayStartDate: new Date(), publishNow: true };

const AddAnnouncement = () => {
  const navigate = useNavigate();
  const { gate } = useValidationGate();
  const location = useLocation();
  const duplicateOf = (location.state as { duplicateOf?: IAnnouncement } | null)?.duplicateOf;

  const { mutateAsync: createAnnouncement, isLoading } = useCreateAnnouncementMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AnnouncementFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(anouncementFormValidationSchema),
    defaultValues: defaultValuesFor(duplicateOf),
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
      <PageHeader
        onBackButtonPress={onBackButtonPress}
        subtitle={`${i18n.t('announcement:page.subtitle')}`}
      >
        {i18n.t('announcement:page.title')}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <AnnouncementFormCard
          title={i18n.t(
            duplicateOf ? 'announcement:create.duplicate_title' : 'announcement:create.title',
          )}
          subtitle={
            duplicateOf
              ? i18n.t('announcement:create.duplicate_subtitle', { name: duplicateOf.name })
              : i18n.t('announcement:create.subtitle')
          }
          disabled={gate.disabled}
          submitTitle={gate.title}
          submitLabel={i18n.t('announcement:actions.create')}
          submitIcon={<PlusIcon className="h-5 w-5" />}
          onCancel={onBackButtonPress}
          onSubmit={handleSubmit(onSubmit)}
        >
          <AnnouncementForm control={control} errors={errors} />
        </AnnouncementFormCard>
      )}
    </PageLayout>
  );
};

export default AddAnnouncement;
