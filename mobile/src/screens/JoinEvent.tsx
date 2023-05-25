import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { StyleSheet } from 'react-native';

type JoinEventFormTypes = {
  mention: string;
};

const schema = yup
  .object({
    mention: yup
      .string()
      .required(`${i18n.t('event:reason_page.form.mention.required')}`)
      .min(2, `${i18n.t('event:reason_page.form.mention.min', { value: 2 })}`)
      .max(250, `${i18n.t('event:reason_page.form.mention.max', { value: 250 })}`),
  })
  .required();

const JoinEvent = ({ navigation }: any) => {
  console.log('JoinEvent');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinEventFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSumit = (payload: JoinEventFormTypes) => {
    console.log(payload);
  };

  return (
    <PageLayout
      title={i18n.t('event:join')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        onPrimaryActionButtonClick: handleSubmit(onSumit),
        primaryActionLabel: i18n.t('general:save'),
      }}
    >
      <FormLayout>
        <Text appearance="hint">{`${i18n.t('event:reason_page.introduction')}`}</Text>
        <FormInput
          control={control as any}
          error={errors.mention}
          name="mention"
          label={i18n.t('event:reason_page.form.mention.label')}
          helper={`${i18n.t('event:reason_page.form.mention.helper')}`}
          multiline={true}
          textStyle={styles.textArea}
          placeholder=""
        />
      </FormLayout>
    </PageLayout>
  );
};

export default JoinEvent;

const styles = StyleSheet.create({
  textArea: {
    minHeight: 52,
  },
});
