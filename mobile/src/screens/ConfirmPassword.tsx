import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { REGEX } from '../common/constants/constants';
import { renderPasswordEyeIcon } from '../components/InputPrefixes';
import { useAuth } from '../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ConfirmPasswordFormTypes = {
  code: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object({
  code: yup
    .string()
    .matches(REGEX.NUMBERS_ONLY, `${i18n.t('confirm_password:form.code.pattern')}`)
    .length(6, `${i18n.t('confirm_password:form.code.length')}`)
    .required(`${i18n.t('confirm_password:form.code.required')}`),
  password: yup
    .string()
    .matches(REGEX.COGNITO_PASSWORD, `${i18n.t('confirm_password:form.password.pattern')}`)
    .required(`${i18n.t('confirm_password:form.password.required')}`),
  confirmPassword: yup
    .string()
    .matches(REGEX.COGNITO_PASSWORD, `${i18n.t('confirm_password:form.password.pattern')}`)
    .oneOf(
      [yup.ref('password'), undefined],
      `${i18n.t('confirm_password:form.confirm_password.match')}`,
    )
    .required(`${i18n.t('confirm_password:form.confirm_password.required')}`),
});

const ConfirmPassword = ({ navigation }: any) => {
  const { t } = useTranslation('confirm_password');

  // show hide password text in input
  const [secureTextEntryPassword, setSecureTextEntryPassword] = useState<boolean>(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState<boolean>(true);

  const { forgotPasswordSubmit } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmPasswordFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ code, password }: ConfirmPasswordFormTypes) => {
    try {
      setIsLoading(true);
      await forgotPasswordSubmit(code, password);
      navigation.navigate('login');
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
      headerStyle={{ paddingTop: useSafeAreaInsets().top + 16 }}
    >
      <FormLayout>
        <FormInput
          control={control as any}
          name="code"
          label={t('form.code.label')}
          placeholder={t('form.code.placeholder')}
          error={errors.code}
          disabled={isLoading}
          required={true}
          keyboardType="phone-pad"
        />
        <FormInput
          control={control as any}
          name="password"
          label={t('form.password.label')}
          placeholder={t('form.password.placeholder')}
          error={errors.password}
          accessoryRight={(props: any) =>
            renderPasswordEyeIcon({
              ...props,
              setSecureTextEntry: setSecureTextEntryPassword,
              secureTextEntry: secureTextEntryPassword,
            })
          }
          secureTextEntry={secureTextEntryPassword}
          disabled={isLoading}
          required={true}
        />
        <FormInput
          control={control as any}
          name="confirmPassword"
          label={t('form.confirm_password.label')}
          placeholder={t('form.confirm_password.placeholder')}
          error={errors.confirmPassword}
          accessoryRight={(props: any) =>
            renderPasswordEyeIcon({
              ...props,
              setSecureTextEntry: setSecureTextEntryConfirm,
              secureTextEntry: secureTextEntryConfirm,
            })
          }
          secureTextEntry={secureTextEntryConfirm}
          disabled={isLoading}
          required={true}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default ConfirmPassword;
