import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import { CheckBox, Text } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import { StyleSheet, View } from 'react-native';
import InlineLink from '../components/InlineLink';
import { Controller } from 'react-hook-form';
import { ALLOW_FONT_SCALLING, CONSTANTS, REGEX } from '../common/constants/constants';
import Paragraph from '../components/Paragraph';
import * as Linking from 'expo-linking';
import { renderPasswordEyeIcon, renderPhoneNumberPrefix } from '../components/InputPrefixes';
import { usePaddingTop } from '../hooks/usePaddingTop';

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
    phone: yup
      .string()
      .matches(REGEX.NUMBERS_ONLY, `${i18n.t('register:create_account.form.phone.pattern')}`)
      .length(9, `${i18n.t('register:create_account.form.phone.length', { number: 10 })}`)
      .required(`${i18n.t('register:create_account.form.phone.required')}`),
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
    terms: yup.boolean().oneOf([true], `${i18n.t('register:create_account.form.terms.required')}`),
  })
  .required();

const CreateAccount = ({ navigation }: any) => {
  // translations
  const { t } = useTranslation('register');
  const paddingTop = usePaddingTop();

  // auth state
  const { signUp } = useAuth();
  // show hide password text in input
  const [secureTextEntryPassword, setSecureTextEntryPassword] = useState<boolean>(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema) as any,
  });

  const onTermsAndConditionsPress = () => {
    Linking.openURL(`${process.env.EXPO_PUBLIC_TERMS_AND_CONDITIONS_LINK}`);
  };

  const onPrivacyPolicyPress = () => {
    Linking.openURL(`${process.env.EXPO_PUBLIC_PRIVACY_POLICY_LINK}`);
  };

  const onSubmit = async ({ email, password, phone }: RegisterFormTypes) => {
    try {
      setIsLoading(true);
      await signUp({
        username: email.trim(),
        password,
        phoneNumber: `${CONSTANTS.PHONE_PREFIX}${phone.trim()}`,
      });
      navigation.replace('validate-account');
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
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3">{`${t(
          'create_account.heading',
        )}`}</Text>
        <Paragraph>{`${t('create_account.paragraph')}`}</Paragraph>
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
          accessoryLeft={renderPhoneNumberPrefix}
          required={true}
        />
        <FormInput
          control={control as any}
          name="password"
          label={t('create_account.form.password.label')}
          placeholder={t('create_account.form.password.placeholder')}
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
          label={t('create_account.form.confirm_password.label')}
          placeholder={t('create_account.form.confirm_password.placeholder')}
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
            <Text allowFontScaling={ALLOW_FONT_SCALLING}>{`${t(
              'create_account.form.terms.agree',
            )}`}</Text>
            <View style={styles.directionRow}>
              <InlineLink
                label={t('create_account.form.terms.conditions')}
                onPress={onTermsAndConditionsPress}
              />
              <Text allowFontScaling={ALLOW_FONT_SCALLING}>{', '}</Text>
            </View>
            <Text allowFontScaling={ALLOW_FONT_SCALLING}>{`${t(
              'create_account.form.terms.and',
            )}`}</Text>
            <InlineLink
              label={t('create_account.form.terms.privacy_policy')}
              onPress={onPrivacyPolicyPress}
            />
            <Text allowFontScaling={ALLOW_FONT_SCALLING}>{`${t(
              'create_account.form.terms.application',
            )}`}</Text>
          </View>
        </View>
        {errors.terms && (
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1" status="danger">
            {errors.terms.message}
          </Text>
        )}
      </FormLayout>
    </PageLayout>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsTextContainer: { flexDirection: 'row', maxWidth: '90%', flexWrap: 'wrap', gap: 4 },
  directionRow: { flexDirection: 'row' },
});
