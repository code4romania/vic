import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import FormInput from '../components/FormInput';
import { useAuth } from '../hooks/useAuth';
import { usePaddingTop } from '../hooks/usePaddingTop';

export type ForgotPasswordFormTypes = {
  email: string;
};

const schema = yup.object({
  email: yup
    .string()
    .email(`${i18n.t('forgot_password:form.email.pattern')}`)
    .required(`${i18n.t('forgot_password:form.email.required')}`),
});

const ForgotPassword = ({ navigation }: any) => {
  const { t } = useTranslation('forgot_password');
  const paddingTop = usePaddingTop();

  const { forgotPassword } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email }: ForgotPasswordFormTypes) => {
    try {
      setIsLoading(true);
      await forgotPassword(email);
      navigation.navigate('confirm-password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title={t('header')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('submit.label'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
      }}
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        <Paragraph>{`${t('paragraph')}`}</Paragraph>
        <FormInput
          control={control as any}
          name="email"
          label={t('form.email.label')}
          placeholder={''}
          error={errors.email}
          disabled={isLoading}
          required={true}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default ForgotPassword;
