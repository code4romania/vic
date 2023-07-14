import React from 'react';
import FormLayout from '../layouts/FormLayout';
import { View } from 'react-native';
import OrganizationIdentity from './OrganizationIdentity';
import EventSelect from '../containers/EventSelect';
import ActivityTypeSelect from '../containers/ActivityTypeSelect';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import { Control, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { useAuth } from '../hooks/useAuth';

export type ActivityLogFormTypes = {
  eventId: string;
  activityTypeId: string;
  date: Date;
  hours: string;
  mentions: string;
  volunteerId?: string;
};

interface ActivityLogFormProps {
  paragraph?: string;
  isLoading?: boolean;
  control: Control<ActivityLogFormTypes, any>;
  errors: FieldErrors<ActivityLogFormTypes>;
}

export const activityLogSchema = yup
  .object({
    activityTypeId: yup.string().required(`${i18n.t('activity_log:form.task.required')}`),
    date: yup.date().required(`${i18n.t('activity_log:form.date.required')}`),
    hours: yup
      .number()
      .typeError(`${i18n.t('activity_log:form.hours.number')}`)
      .integer(`${i18n.t('activity_log:form.hours.integer')}`)
      .required(`${i18n.t('activity_log:form.hours.required')}`)
      .min(1, `${i18n.t('activity_log:form.hours.min', { value: 1 })}`)
      .max(300, `${i18n.t('activity_log:form.hours.max', { value: 300 })}`),
    mentions: yup.string().max(300, `${i18n.t('activity_log:form.mentions.max', { value: 300 })}`),
  })
  .required();

const ActivityLogForm = ({ isLoading, control, errors }: ActivityLogFormProps) => {
  const { userProfile } = useAuth();

  const { t } = useTranslation('activity_log');

  return (
    <FormLayout>
      <View />
      {userProfile?.activeOrganization && (
        <OrganizationIdentity
          uri={userProfile.activeOrganization.logo || ''}
          name={userProfile.activeOrganization.name}
        />
      )}
      <EventSelect
        name="eventId"
        control={control as any}
        error={errors.eventId}
        label={t('form.event.label')}
        placeholder={t('general:select')}
        organizationId={userProfile?.activeOrganization?.id as string}
        disabled={isLoading}
      />
      <ActivityTypeSelect
        name="activityTypeId"
        control={control as any}
        error={errors.activityTypeId}
        label={t('form.task.label')}
        placeholder={t('general:select')}
        organizationId={userProfile?.activeOrganization?.id as string}
        required
        disabled={isLoading}
      />
      <FormDatePicker
        name="date"
        control={control as any}
        error={errors.date}
        min={new Date(2000)}
        label={t('form.date.label')}
        placeholder={t('general:select')}
        required
        disabled={isLoading}
      />
      <FormInput
        name="hours"
        control={control as any}
        error={errors.hours}
        label={t('form.hours.label')}
        placeholder={t('form.hours.placeholder')}
        keyboardType="phone-pad"
        required
        disabled={isLoading}
      />
      <FormInput
        name="mentions"
        control={control as any}
        error={errors.mentions}
        multiline={true}
        label={t('form.mentions.label')}
        placeholder={t('form.mentions.placeholder')}
        disabled={isLoading}
      />
    </FormLayout>
  );
};

export default ActivityLogForm;
