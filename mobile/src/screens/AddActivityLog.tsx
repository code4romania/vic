import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useForm } from 'react-hook-form';
import FormLayout from '../layouts/FormLayout';
import * as yup from 'yup';
import FormSelect, { ISelectItem } from '../components/FormSelect';
import { yupResolver } from '@hookform/resolvers/yup';
import FormDatePicker from '../components/FormDatePicker';
import FormInput from '../components/FormInput';
import { StyleSheet } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import { View } from 'react-native';

const options: ISelectItem[] = [
  { key: 33, label: 'Prima optiune' },
  { key: 123, label: 'A doua optiune' },
  { key: 31233, label: 'A treia optiune' },
];

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
      title={i18n.t('general:add', { item: i18n.t('activity_log:title').toLowerCase() })}
      onDismiss={navigation.goBack}
      actionsOptions={{
        onActionLabel: i18n.t('general:add', { item: '' }),
        onActionButtonClick: handleSubmit(onSubmit),
        buttonType: ButtonType.PRIMARY,
      }}
    >
      <FormLayout>
        <View />
        <OrganizationIdentity uri="https://picsum.photos/200/300" name="Asociația ZEN" />
        <FormSelect
          name="eventId"
          control={control as any}
          error={errors.eventId}
          options={options}
          label={i18n.t('activity_log:form.event.label')}
          placeholder={i18n.t('general:select')}
        />
        <FormSelect
          name="activityTypeId"
          control={control as any}
          error={errors.activityTypeId}
          options={options}
          label={i18n.t('activity_log:form.task.label')}
          placeholder={i18n.t('general:select')}
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
