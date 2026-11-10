import React from 'react';
import FormLayout from '../layouts/FormLayout';
import { StyleSheet, View } from 'react-native';
import { Avatar, VText } from './ui';
import EventSelect from '../containers/EventSelect';
import ActivityTypeSelect from '../containers/ActivityTypeSelect';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import HoursStepper from './hours/HoursStepper';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { useUserProfile } from '../store/profile/profile.selector';
import { ACTIVITY_LOG_DATE_MIN, endOfToday, isFutureDay } from '../common/utils/date-bounds';

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
    date: yup
      .date()
      .required(`${i18n.t('activity_log:form.date.required')}`)
      .test(
        'not-future',
        `${i18n.t('activity_log:form.date.future')}`,
        (date) => !isFutureDay(date),
      ),
    hours: yup
      .number()
      .typeError(`${i18n.t('activity_log:form.hours.number')}`)
      .integer(`${i18n.t('activity_log:form.hours.integer')}`)
      .required(`${i18n.t('activity_log:form.hours.required')}`)
      .min(1, `${i18n.t('activity_log:form.hours.min', { value: 1 })}`)
      .max(300, `${i18n.t('activity_log:form.hours.max', { value: 300 })}`),
    mentions: yup
      .string()
      .max(300, `${i18n.t('activity_log:form.mentions.max', { value: 300 })}`)
      .nullable(),
  })
  .required();

const ActivityLogForm = ({ isLoading, control, errors }: ActivityLogFormProps) => {
  const { userProfile } = useUserProfile();

  const { t } = useTranslation('activity_log');

  return (
    <FormLayout>
      <View />
      {userProfile?.activeOrganization && (
        <View style={styles.organization}>
          <Avatar
            name={userProfile.activeOrganization.name}
            uri={userProfile.activeOrganization.logo}
            size={36}
            shape="rounded"
          />
          <VText variant="label" numberOfLines={1} style={styles.organizationName}>
            {userProfile.activeOrganization.name}
          </VText>
        </View>
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
        min={ACTIVITY_LOG_DATE_MIN}
        max={endOfToday()}
        label={t('form.date.label')}
        placeholder={t('general:select')}
        required
        disabled={isLoading}
      />
      <Controller
        name="hours"
        control={control}
        render={({ field: { value, onChange } }) => (
          <HoursStepper
            label={`${t('form.hours.label')}`}
            value={Number(value) || 0}
            onChange={(next) => onChange(`${next}`)}
            error={errors.hours?.message}
            disabled={isLoading}
          />
        )}
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

const styles = StyleSheet.create({
  organization: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  organizationName: { flex: 1 },
});
