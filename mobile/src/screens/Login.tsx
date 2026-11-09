import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { yupResolver } from '@hookform/resolvers/yup';
import Paragraph from '../components/Paragraph';
import InlineLink from '../components/InlineLink';
import { StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { ALLOW_FONT_SCALLING, REGEX } from '../common/constants/constants';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { isMigrationNoticeActive } from '../common/utils/migration-notice';

// A new code can be asked for once a minute (the backend answers AUTH_010 sooner).
export const RESEND_AFTER_SECONDS = 60;

type EmailForm = { email: string };
type CodeForm = { code: string };

const emailSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email(`${i18n.t('login:form.email.pattern')}`)
    .required(`${i18n.t('login:form.email.required')}`),
});

const codeSchema = yup.object({
  code: yup
    .string()
    .trim()
    .matches(REGEX.NUMBERS_ONLY, `${i18n.t('login:form.code.pattern')}`)
    .length(6, `${i18n.t('login:form.code.length')}`)
    .required(`${i18n.t('login:form.code.required')}`),
});

// VIC 2.0 (#514): no passwords. Step 1: the email; step 2: the 6-digit code we emailed. A new email
// gets an account too (sign-up = login); without a volunteer profile yet the app opens CreateUser.
// route.params.email: from the vic://login?email= link (the web's pages for volunteers).
const Login = ({ navigation, route }: any) => {
  const linkEmail: string | undefined = route?.params?.email;
  const { requestLoginCode, loginWithCode } = useAuth();
  const { t } = useTranslation('login');
  const paddingTop = usePaddingTop();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // set once a code was sent: the screen shows the code step
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const emailForm = useForm<EmailForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(emailSchema),
    defaultValues: { email: linkEmail ?? '' },
  });

  const codeForm = useForm<CodeForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const { setValue } = emailForm;
  // the link can also arrive while Login is already open
  useEffect(() => {
    if (linkEmail) {
      setValue('email', linkEmail);
      setMaskedEmail(null);
    }
  }, [linkEmail, setValue]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // errors are shown by the auth context
  const sendCode = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setMaskedEmail(await requestLoginCode(email));
      setSecondsLeft(RESEND_AFTER_SECONDS);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEmail = async ({ email }: EmailForm) => {
    await sendCode(email);
  };

  const onResend = async () => {
    if (secondsLeft > 0 || isLoading) {
      return;
    }
    codeForm.reset({ code: '' });
    if (await sendCode(emailForm.getValues('email'))) {
      Toast.show({ type: 'success', text1: `${t('code.resent')}` });
    }
  };

  const onSubmitCode = async ({ code }: CodeForm) => {
    try {
      setIsLoading(true);
      // logs in: the Router switches to the private routes
      await loginWithCode(code);
    } catch (error: any) {
      if (error?.createUser) {
        navigation.navigate('create-user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeEmail = () => {
    codeForm.reset({ code: '' });
    setMaskedEmail(null);
  };

  if (maskedEmail) {
    return (
      <PageLayout
        title={t('code.title')}
        onBackButtonPress={onChangeEmail}
        actionsOptions={{
          primaryActionLabel: t('code.submit'),
          onPrimaryActionButtonClick: codeForm.handleSubmit(onSubmitCode),
          loading: isLoading,
        }}
        headerStyle={{ paddingTop }}
      >
        <FormLayout>
          <Paragraph>{`${t('code.paragraph', { email: maskedEmail })}`}</Paragraph>
          <FormInput
            control={codeForm.control as any}
            name="code"
            label={t('form.code.label')}
            placeholder={t('form.code.placeholder')}
            error={codeForm.formState.errors.code}
            disabled={isLoading}
            required={true}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={6}
          />
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2" style={styles.hint}>
            {`${t('code.not_received')}`}
          </Text>
          {secondsLeft > 0 ? (
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2" appearance="hint">
              {`${t('code.resend_in', { seconds: secondsLeft })}`}
            </Text>
          ) : (
            <InlineLink label={t('code.resend')} onPress={onResend} />
          )}
          <InlineLink label={t('code.change_email')} onPress={onChangeEmail} />
        </FormLayout>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('submit'),
        onPrimaryActionButtonClick: emailForm.handleSubmit(onSubmitEmail),
        loading: isLoading,
      }}
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        <Paragraph>{`${t('paragraph')}`}</Paragraph>
        {isMigrationNoticeActive() && (
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2" style={styles.hint}>
            {`${t('migration_notice')}`}
          </Text>
        )}
        <FormInput
          control={emailForm.control as any}
          name="email"
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          error={emailForm.formState.errors.email}
          disabled={isLoading}
          required={true}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </FormLayout>
    </PageLayout>
  );
};

export default Login;

const styles = StyleSheet.create({
  hint: { lineHeight: 20 },
});
