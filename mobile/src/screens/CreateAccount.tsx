import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { CheckBox, Icon, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import { View } from 'react-native';
import InlineLink from '../components/InlineLink';
import { Controller } from 'react-hook-form';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export type RegisterFormTypes = {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
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
    terms: yup.boolean().oneOf([true], `${i18n.t('register:create_account.form.terms.required')}`),
  })
  .required();

const CreateAccount = ({ navigation }: any) => {
  const styles = useStyleSheet(themedStyles);
  const { t } = useTranslation('register');
  // auth state
  const { signUp } = useAuth();
  // show hide password text in input
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onTermsAndConditionsPress = () => {
    console.log('on terms and conditions pressed');
  };

  const onPrivacyPolicyPress = () => {
    console.log('on privacy policy pressed');
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  console.log('errors', errors);

  const onSubmit = async ({ email, password, phone }: RegisterFormTypes) => {
    try {
      setIsLoading(true);
      await signUp({ username: email, password, phoneNumber: phone });
      Toast.show({ type: 'success', text1: 'Done creating account' });
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
        <Text appearance="hint">{`${t('create_account.paragraph')}`}</Text>
        <FormInput
          control={control as any}
          name="email"
          label={t('create_account.form.email.label')}
          placeholder={t('create_account.form.email.placeholder')}
          error={errors.email}
          disabled={isLoading}
          required={true}
        />
        <FormInput
          control={control as any}
          name="phone"
          label={t('create_account.form.phone.label')}
          placeholder={t('create_account.form.phone.placeholder')}
          error={errors.phone}
          disabled={isLoading}
          keyboardType="phone-pad"
          required={true}
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
          required={true}
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
          required={true}
        />

        {/* Terms and conditions/Privacy Policy */}
        <View style={styles.termsContainer}>
          <Controller
            control={control}
            name="terms"
            defaultValue={false}
            render={({ field: { onChange, value } }) => (
              <CheckBox
                checked={value}
                onChange={onChange}
                status={errors.terms ? 'danger' : 'basic'}
              />
            )}
          />
          <View style={styles.termsTextContainer}>
            <Text>{`${t('create_account.form.terms.agree')}`}</Text>
            <InlineLink
              label={t('create_account.form.terms.conditions')}
              onPress={onTermsAndConditionsPress}
            />
            <Text>{`${t('create_account.form.terms.and')}`}</Text>
            <InlineLink
              label={t('create_account.form.terms.privacy_policy')}
              onPress={onPrivacyPolicyPress}
            />
            <Text>{`${t('create_account.form.terms.application')}`}</Text>
          </View>
        </View>
        {errors.terms && (
          <Text category="c1" status="danger">
            {errors.terms.message}
          </Text>
        )}
      </FormLayout>
    </PageLayout>
  );
};

export default CreateAccount;

const themedStyles = StyleService.create({
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsTextContainer: { flexDirection: 'row', maxWidth: '90%', flexWrap: 'wrap' },
});
