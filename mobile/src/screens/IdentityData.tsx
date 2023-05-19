import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import InlineLink from '../components/InlineLink';
import FormInput from '../components/FormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import FormDatePicker from '../components/FormDatePicker';

type IdentityDataFormTypes = {
  series: string;
  number: number;
  address: string;
  issueDate: Date;
  expirationDate: Date;
};

const schema = yup
  .object({
    series: yup
      .string()
      .required(`${i18n.t('identity_data:form.series.required')}`)
      .length(2, `${i18n.t('identity_data:form.series.length', { number: 2 })}`),
    number: yup
      .string()
      .required(`${i18n.t('identity_data:form.number.required')}`)
      .matches(/^[0-9]+$/, `${i18n.t('identity_data:form.number.matches')}`)
      .length(6, `${i18n.t('identity_data:form.number.length', { number: 6 })}`),
    address: yup
      .string()
      .required(`${i18n.t('identity_data:form.address.required')}`)
      .min(2, `${i18n.t('identity_data:form.address.min', { value: 2 })}`)
      .max(100, `${i18n.t('identity_data:form.address.max', { value: 100 })}`),
    issueDate: yup.date().required(`${i18n.t('identity_data:form.issue_date.required')}`),
    expirationDate: yup.date().required(`${i18n.t('identity_data:form.expiration_date.required')}`),
  })
  .required();

const IdentityData = ({ navigation }: any) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IdentityDataFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onPrivacyPolicyPress = () => {
    console.log('privacy policy pressed');
  };

  const onSubmit = (payload: IdentityDataFormTypes) => {
    console.log(payload);
  };

  return (
    <PageLayout
      title={i18n.t('settings:identity')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: i18n.t('general:save'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
      }}
    >
      <FormLayout>
        <Text appearance="hint">{`${i18n.t('identity_data:description')}`}</Text>
        <InlineLink
          label={i18n.t('identity_data:privacy_policy')}
          onPress={onPrivacyPolicyPress}
          category="p2"
        />
        <FormInput
          control={control as any}
          label={i18n.t('identity_data:form.series.label')}
          name="series"
          error={errors.series}
          placeholder={i18n.t('identity_data:form.series.placeholder')}
        />
        <FormInput
          control={control as any}
          label={i18n.t('identity_data:form.number.label')}
          name="number"
          error={errors.number}
          placeholder={i18n.t('identity_data:form.number.placeholder')}
        />
        <FormInput
          control={control as any}
          label={i18n.t('identity_data:form.address.label')}
          name="address"
          error={errors.address}
          placeholder={i18n.t('identity_data:form.address.placeholder')}
          helper={`${i18n.t('identity_data:form.address.helper')}`}
        />
        <FormDatePicker
          control={control as any}
          label={i18n.t('identity_data:form.issue_date.label')}
          name="issueDate"
          error={errors.issueDate}
          placeholder={i18n.t('general:select')}
          min={new Date(1900, 0, 0)}
        />
        <FormDatePicker
          control={control as any}
          label={i18n.t('identity_data:form.expiration_date.label')}
          name="expirationDate"
          error={errors.expirationDate}
          placeholder={i18n.t('general:select')}
          max={new Date(2200, 0, 0)}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default IdentityData;
