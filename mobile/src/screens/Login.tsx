import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { yupResolver } from '@hookform/resolvers/yup';
import { renderPasswordEyeIcon } from '../components/InputPrefixes';
import Paragraph from '../components/Paragraph';
import { Pressable } from 'react-native';
import { Text } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { usePaddingTop } from '../hooks/usePaddingTop';

export type LoginFormTypes = {
  username: string;
  password: string;
};

const schema = yup.object({
  username: yup
    .string()
    .email(`${i18n.t('login:form.email.pattern')}`)
    .required(`${i18n.t('login:form.email.required')}`),
  password: yup.string().required(`${i18n.t('login:form.password.required')}`),
});

const Login = ({ navigation }: any) => {
  const { login, resendConfirmationCode } = useAuth();
  const { t } = useTranslation('login');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const paddingTop = usePaddingTop();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async (credentials: LoginFormTypes) => {
    try {
      setIsLoading(true);
      await login(credentials);
      setIsLoading(false);
    } catch (error: any) {
      // the user is created in cognito but the email/phone number is not verified
      if (error.confirmAccount) {
        // resend validation email
        onRevalidateAccount(credentials.username);
      } else if (error.createUser) {
        navigation.navigate('create-user');
      } else {
        setIsLoading(false);
      }
    }
  };

  const onRevalidateAccount = async (username: string) => {
    try {
      await resendConfirmationCode(username);
      navigation.navigate('validate-account');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoToResetPassword = () => {
    navigation.navigate('forgot-password');
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('submit'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
      }}
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        <Paragraph>{`${t('paragraph')}`}</Paragraph>
        <FormInput
          control={control as any}
          name="username"
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          error={errors.username}
          disabled={isLoading}
          required={true}
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
              setSecureTextEntry,
              secureTextEntry,
            })
          }
          secureTextEntry={secureTextEntry}
          disabled={isLoading}
          required={true}
        />
        <Pressable onPress={onGoToResetPassword}>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">
            {`${t('forgot_password')}`}
          </Text>
        </Pressable>
      </FormLayout>
    </PageLayout>
  );
};

export default Login;
