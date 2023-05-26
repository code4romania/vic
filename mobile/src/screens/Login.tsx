import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Icon, Text } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { yupResolver } from '@hookform/resolvers/yup';
import { Pressable } from 'react-native';

export type LoginFormTypes = {
  username: string;
  password: string;
};

const schema = yup
  .object({
    username: yup
      .string()
      .email(`${i18n.t('login:form.email.pattern')}`)
      .required(`${i18n.t('login:form.email.required')}`),

    password: yup.string().required(`${i18n.t('login:form.password.required')}`),
  })
  .required();

const Login = ({ navigation }: any) => {
  const { login, resendConfirmationCode } = useAuth();
  const { t } = useTranslation('login');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    } catch (error: any) {
      // here we do noting and error will be thrown from the context
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordEyeIcon = (props: any): React.ReactElement => (
    <Pressable onPress={setSecureTextEntry.bind(null, !secureTextEntry)}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </Pressable>
  );

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('submit'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
      }}
    >
      <FormLayout>
        <Text appearance="hint">{`${t('paragraph')}`}</Text>
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
          accessoryRight={renderPasswordEyeIcon}
          secureTextEntry={secureTextEntry}
          disabled={isLoading}
          required={true}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default Login;
