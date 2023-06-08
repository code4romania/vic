import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useForm } from 'react-hook-form';
import FormLayout from '../layouts/FormLayout';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormDatePicker from '../components/FormDatePicker';
import FormInput from '../components/FormInput';
import { StyleSheet } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import { View } from 'react-native';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import { useTranslation } from 'react-i18next';
import EventSelect from '../containers/EventSelect';
import ActivityTypeSelect from '../containers/ActivityTypeSelect';

export type AddActivityLogFormTypes = {
  eventId: number;
  activityTypeId: number;
  date: Date;
  hours: number;
  mentions: string;
};

const schema = yup
  .object({
    activityTypeId: yup.number().required(`${i18n.t('activity_log:form.task.required')}`),
    date: yup.date().required(`${i18n.t('activity_log:form.date.required')}`),
    hours: yup
      .number()
      .typeError(`${i18n.t('activity_log:form.hours.number')}`)
      .integer(`${i18n.t('activity_log:form.hours.integer')}`)
      .required(`${i18n.t('activity_log:form.hours.required')}`)
      .min(1, `${i18n.t('activity_log:form.hours.min', { value: 0 })}`)
      .max(300, `${i18n.t('activity_log:form.hours.max', { value: 300 })}`),
    mentions: yup.string().max(300, `${i18n.t('activity_log:form.mentions.max', { value: 300 })}`),
  })
  .required();

const AddActivityLog = ({ navigation }: any) => {
  console.log('AddActivityLog');
  // translations
  const { t } = useTranslation('activity_log');

  const { activeOrganization } = useActiveOrganization();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddActivityLogFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (payload: AddActivityLogFormTypes) => {
    console.log(payload);
  };

  return (
    <ModalLayout
      title={i18n.t('general:add', { item: t('title').toLowerCase() })}
      onDismiss={navigation.goBack}
      actionsOptions={{
        actionLabel: i18n.t('general:add', { item: '' }),
        onActionButtonClick: handleSubmit(onSubmit),
        buttonType: ButtonType.PRIMARY,
      }}
    >
      <FormLayout>
        <View />
        {activeOrganization && (
          <OrganizationIdentity
            uri={activeOrganization.logo || ''}
            name={activeOrganization.name}
          />
        )}
        <EventSelect
          name="eventId"
          control={control as any}
          error={errors.eventId}
          label={i18n.t('activity_log:form.event.label')}
          placeholder={i18n.t('general:select')}
          organizationId={activeOrganization?.id as string}
        />
        <ActivityTypeSelect
          name="activityTypeId"
          control={control as any}
          error={errors.activityTypeId}
          label={i18n.t('activity_log:form.task.label')}
          placeholder={i18n.t('general:select')}
          organizationId={activeOrganization?.id as string}
          required
        />
        <FormDatePicker
          name="date"
          control={control as any}
          error={errors.date}
          min={new Date(2000)}
          label={i18n.t('activity_log:form.date.label')}
          placeholder={i18n.t('general:select')}
          required
        />
        <FormInput
          name="hours"
          control={control as any}
          error={errors.hours}
          label={i18n.t('activity_log:form.hours.label')}
          placeholder={i18n.t('activity_log:form.hours.placeholder')}
          required
        />
        <FormInput
          name="mentions"
          control={control as any}
          error={errors.mentions}
          multiline={true}
          textStyle={styles.textArea}
          label={i18n.t('activity_log:form.mentions.label')}
          placeholder={i18n.t('activity_log:form.mentions.placeholder')}
        />
      </FormLayout>
    </ModalLayout>
  );
};

export default AddActivityLog;

const styles = StyleSheet.create({
  textArea: {
    minHeight: 52,
  },
});
