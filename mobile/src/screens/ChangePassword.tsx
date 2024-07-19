import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import { useAuth } from '../hooks/useAuth';
import { REGEX } from '../common/constants/constants';
import { renderPasswordEyeIcon } from '../components/InputPrefixes';
import { usePaddingTop } from '../hooks/usePaddingTop';

export type ChangePasswordFormTypes = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object({
  oldPassword: yup
    .string()
    .matches(REGEX.COGNITO_PASSWORD, `${i18n.t('register:create_account.form.password.pattern')}`)
    .required(`${i18n.t('register:create_account.form.password.required')}`),
  password: yup
    .string()
    .matches(REGEX.COGNITO_PASSWORD, `${i18n.t('register:create_account.form.password.pattern')}`)
    .required(`${i18n.t('register:create_account.form.password.required')}`),
  confirmPassword: yup
    .string()
    .matches(REGEX.COGNITO_PASSWORD, `${i18n.t('register:create_account.form.password.pattern')}`)
    .oneOf(
      [yup.ref('password'), undefined],
      `${i18n.t('register:create_account.form.confirm_password.match')}`,
    )
    .required(`${i18n.t('register:create_account.form.confirm_password.required')}`),
});

const ChangePassword = ({ navigation }: any) => {
  const { t } = useTranslation('change_password');
  const paddingTop = usePaddingTop();

  // auth state
  const { changePassword } = useAuth();
  // show hide password text in input
  const [secureTextEntryOldPassword, setSecureTextEntryOldPassword] = useState<boolean>(true);
  const [secureTextEntryNewPassword, setSecureTextEntryNewPassword] = useState<boolean>(true);
  const [secureTextEntryConfirmNewPassword, setSecureTextEntryConfirmNewPassword] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ChangePasswordFormTypes) => {
    try {
      setIsLoading(true);
      await changePassword(data.oldPassword, data.password);
      reset({});
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:save'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
      }}
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        <FormInput
          control={control as any}
          name="oldPassword"
          label={t('register:create_account.form.password.label')}
          placeholder={t('register:create_account.form.password.placeholder')}
          error={errors.oldPassword}
          accessoryRight={(props: any) =>
            renderPasswordEyeIcon({
              ...props,
              setSecureTextEntry: setSecureTextEntryOldPassword,
              secureTextEntry: secureTextEntryOldPassword,
            })
          }
          secureTextEntry={secureTextEntryOldPassword}
          disabled={isLoading}
        />
        <FormInput
          control={control as any}
          name="password"
          label={t('register:create_account.form.password.label')}
          placeholder={t('register:create_account.form.password.placeholder')}
          error={errors.password}
          accessoryRight={(props: any) =>
            renderPasswordEyeIcon({
              ...props,
              setSecureTextEntry: setSecureTextEntryNewPassword,
              secureTextEntry: secureTextEntryNewPassword,
            })
          }
          secureTextEntry={secureTextEntryNewPassword}
          disabled={isLoading}
        />
        <FormInput
          control={control as any}
          name="confirmPassword"
          label={t('register:create_account.form.confirm_password.label')}
          placeholder={t('register:create_account.form.confirm_password.placeholder')}
          error={errors.confirmPassword}
          accessoryRight={(props: any) =>
            renderPasswordEyeIcon({
              ...props,
              setSecureTextEntry: setSecureTextEntryConfirmNewPassword,
              secureTextEntry: secureTextEntryConfirmNewPassword,
            })
          }
          secureTextEntry={secureTextEntryConfirmNewPassword}
          disabled={isLoading}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default ChangePassword;
