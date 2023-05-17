import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { useAuth } from '../hooks/useAuth';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { Text } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [storageContent, setStorageContent] = useState<string>('');

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

      const content = AsyncStorage.getAllKeys();
      setStorageContent(JSON.stringify(content));
      console.log('account has been validated');
      // navigation.replace('create-user');
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
        <Text appearance="hint">{`${t('validate_account.paragraph')}`}</Text>
        <Text appearance="hint">{`${storageContent}`}</Text>
        <FormInput
          control={control as any}
          name="code"
          label={t('validate_account.form.code.label')}
          placeholder={t('validate_account.form.code.placeholder')}
          error={errors.code}
          disabled={isLoading}
          required={true}
          keyboardType="phone-pad"
        />
      </FormLayout>
    </PageLayout>
  );
};

export default ValidateAccount;
