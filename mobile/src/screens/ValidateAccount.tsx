import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { useAuth } from '../hooks/useAuth';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import FormInput from '../components/FormInput';
import { Text } from '@ui-kitten/components';

export type ValidateAccountFormTypes = {
  code: string;
};

const schema = yup
  .object({
    code: yup
      .string()
      .length(6, `${i18n.t('register:validate_account.form.code.length')}`)
      .required(`${i18n.t('register:validate_account.form.code.required')}`),
  })
  .required();

const ValidateAccount = ({ navigation }: any) => {
  const { t } = useTranslation('register');
  const { confirmSignUp } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidateAccountFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ code }: ValidateAccountFormTypes) => {
    try {
      console.log('code', code);
      setIsLoading(true);
      await confirmSignUp(code);
      console.log('account has been validated');
      navigation.goBack();
    } catch (error) {
      console.log('error on confirm signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:continue'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
      }}
    >
      <FormLayout>
        <Text category="h3">{`${t('validate_account.heading')}`}</Text>
        <Paragraph>{`${t('validate_account.paragraph')}`}</Paragraph>
        <FormInput
          control={control as any}
          name="code"
          label={t('validate_account.form.code.label')}
          placeholder={t('validate_account.form.code.placeholder')}
          error={errors.code}
          disabled={isLoading}
          keyboardType="phone-pad"
        />
      </FormLayout>
    </PageLayout>
  );
};

export default ValidateAccount;
