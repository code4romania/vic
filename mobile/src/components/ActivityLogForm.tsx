import React from 'react';
import FormLayout from '../layouts/FormLayout';
import { StyleSheet, View } from 'react-native';
import { Avatar, VText } from './ui';
import EventSelect from '../containers/EventSelect';
import ActivityTypeSelect from '../containers/ActivityTypeSelect';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
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
  /**
   * Inside the „Adaugă ore” sheet: the fields only (the sheet scrolls them), no organization row,
   * and the text field uses the sheet's keyboard-aware input.
   */
  inSheet?: boolean;
  /** the „Mențiuni” field gets / loses focus (the sheet scrolls it above its footer) */
  onMentionsFocus?: () => void;
  onMentionsBlur?: () => void;
}

// The backend's rule (M12): whole hours, at least 1, at most 24 in a day
export const HOURS_MIN = 1;
export const HOURS_MAX = 24;

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
      .min(HOURS_MIN, `${i18n.t('activity_log:form.hours.min', { value: HOURS_MIN })}`)
      .max(HOURS_MAX, `${i18n.t('activity_log:form.hours.max', { value: HOURS_MAX })}`),
    mentions: yup
      .string()
      .max(300, `${i18n.t('activity_log:form.mentions.max', { value: 300 })}`)
      .nullable(),
  })
  .required();

const ActivityLogForm = ({
  isLoading,
  control,
  errors,
  inSheet = false,
  onMentionsFocus,
  onMentionsBlur,
}: ActivityLogFormProps) => {
  const { userProfile } = useUserProfile();

  const { t } = useTranslation('activity_log');

  const fields = (
    <>
      <EventSelect
        name="eventId"
        control={control as any}
        error={errors.eventId}
        label={t('form.event.label')}
        placeholder={t('form.event.placeholder')}
        organizationId={userProfile?.activeOrganization?.id as string}
        {...(inSheet ? { noneLabel: `${t('form.event.none')}` } : {})}
        optional
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
        quickOptions
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
            min={HOURS_MIN}
            max={HOURS_MAX}
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
        optional
        disabled={isLoading}
        {...(onMentionsFocus ? { onFocus: onMentionsFocus } : {})}
        {...(onMentionsBlur ? { onBlur: onMentionsBlur } : {})}
        {...(inSheet ? { InputComponent: BottomSheetTextInput } : {})}
      />
    </>
  );

  if (inSheet) {
    return fields;
  }

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
          <VText variant="label" numberOfLines={2} style={styles.organizationName}>
            {userProfile.activeOrganization.name}
          </VText>
        </View>
      )}
      {fields}
    </FormLayout>
  );
};

export default ActivityLogForm;

const styles = StyleSheet.create({
  organization: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  organizationName: { flex: 1 },
});
