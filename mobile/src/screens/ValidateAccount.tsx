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
import { ALLOW_FONT_SCALLING, REGEX } from '../common/constants/constants';
import Paragraph from '../components/Paragraph';

export type ValidateAccountFormTypes = {
  code: string;
};

const schema = yup
  .object({
    code: yup
      .string()
      .matches(REGEX.NUMBERS_ONLY, `${i18n.t('register:validate_account.form.code.pattern')}`)
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
      setIsLoading(true);
      await confirmSignUp(code);
      navigation.replace('create-user');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoToLogin = () => {
    navigation.navigate('login');
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:continue'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
        onSecondaryActionButtonClick: onGoToLogin,
        secondaryActionLabel: `${t('create_account.secondary_action.label')}`,
        secondaryActionLink: `${t('create_account.secondary_action.link')}`,
      }}
    >
      <FormLayout>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3">{`${t(
          'validate_account.heading',
        )}`}</Text>
        <Paragraph>{`${t('validate_account.paragraph')}`}</Paragraph>
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
