import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import FormInput from '../components/FormInput';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Icon, Text } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';

export type RegisterFormTypes = {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const schema = yup
  .object({
    email: yup
      .string()
      .email(`${i18n.t('register:create_account.form.email.pattern')}`)
      .required(`${i18n.t('register:create_account.form.email.required')}`),
    phone: yup.string().required(`${i18n.t('register:create_account.form.phone.required')}`),
    password: yup.string().required(`${i18n.t('register:create_account.form.password.required')}`),
    confirmPassword: yup
      .string()
      .oneOf(
        [yup.ref('password'), undefined],
        `${i18n.t('register:create_account.form.confirm_password.match')}`,
      )
      .required(`${i18n.t('register:create_account.form.confirm_password.required')}`),
  })
  .required();

const CreateAccount = ({ navigation }: any) => {
  const { t } = useTranslation('register');
  // auth state
  const { signUp } = useAuth();
  // show hide password text in input
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  console.log('errors', errors);

  const onSubmit = async ({ email, password, phone }: RegisterFormTypes) => {
    try {
      setIsLoading(true);
      await signUp({ username: email, password, phoneNumber: phone });
      console.log('success');
      navigation.replace('validate-account');
    } catch (error) {
      console.log('error');
      // show toast message or any error message
    } finally {
      console.log('loading false');
      setIsLoading(false);
    }
  };

  const renderPasswordEyeIcon = (props: any): React.ReactElement => (
    <TouchableWithoutFeedback onPress={setSecureTextEntry.bind(null, !secureTextEntry)}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

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
        <Text category="h3">{`${t('create_account.heading')}`}</Text>
        <Paragraph>{`${t('create_account.paragraph')}`}</Paragraph>
        <FormInput
          control={control as any}
          name="email"
          label={t('create_account.form.email.label')}
          placeholder={t('create_account.form.email.placeholder')}
          error={errors.email}
          disabled={isLoading}
        />
        <FormInput
          control={control as any}
          name="phone"
          label={t('create_account.form.phone.label')}
          placeholder={t('create_account.form.phone.placeholder')}
          error={errors.phone}
          disabled={isLoading}
          keyboardType="phone-pad"
        />
        <FormInput
          control={control as any}
          name="password"
          label={t('create_account.form.password.label')}
          placeholder={t('create_account.form.password.placeholder')}
          error={errors.password}
          accessoryRight={renderPasswordEyeIcon}
          secureTextEntry={secureTextEntry}
          disabled={isLoading}
        />
        <FormInput
          control={control as any}
          name="confirmPassword"
          label={t('create_account.form.confirm_password.label')}
          placeholder={t('create_account.form.confirm_password.placeholder')}
          error={errors.confirmPassword}
          accessoryRight={renderPasswordEyeIcon}
          secureTextEntry={secureTextEntry}
          disabled={isLoading}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default CreateAccount;
