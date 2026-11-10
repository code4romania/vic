import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useAuth } from '../hooks/useAuth';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import {
  Enter,
  PressableScale,
  StatusBarScrim,
  VButton,
  VText,
  VTextField,
} from '../components/ui';
import { CodeInput, CodeInputHandle } from '../components/auth/CodeInput';
import { colors, fonts, shadows, spacing } from '../common/theme/tokens';
import { isMigrationNoticeActive } from '../common/utils/migration-notice';

// A new code can be asked for once a minute (the backend answers AUTH_010 sooner).
export const RESEND_AFTER_SECONDS = 60;
export const CODE_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BackButton = ({ onPress, label }: { onPress: () => void; label: string }) => (
  <PressableScale
    onPress={onPress}
    accessibilityLabel={label}
    style={[styles.back, shadows.back]}
    testID="login-back"
  >
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </PressableScale>
);

const MailTile = () => (
  <View style={styles.tile}>
    <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h18v12H3zM3 7l9 6 9-6"
        stroke={colors.navy}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

/**
 * VIC 2.0 (#514): no passwords. Landing's email sheet sends the code and opens this screen on the
 * code step ("Verifică-ți emailul", six boxes, resend after 60s). Opened directly (the
 * vic://login?email= link from the web), it starts with the email step.
 * A new email gets an account too (sign-up = login); without a volunteer profile the app opens
 * CreateUser.
 */
const Login = ({ navigation, route }: any) => {
  const linkEmail: string | undefined = route?.params?.email;
  const sentTo: string | undefined = route?.params?.maskedEmail;
  const { requestLoginCode, loginWithCode } = useAuth();
  const { t } = useTranslation('login');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
  const codeRef = useRef<CodeInputHandle>(null);

  const [email, setEmail] = useState<string>(linkEmail ?? '');
  const [emailError, setEmailError] = useState<string | undefined>();
  // set once a code was sent: the screen shows the code step
  const [maskedEmail, setMaskedEmail] = useState<string | null>(sentTo ?? null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(sentTo ? RESEND_AFTER_SECONDS : 0);
  // while the keyboard is open the code step drops the mail tile and the "open mail" button,
  // so the boxes, "Alt email" and the spam hint fit above it on small phones (iPhone SE)
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // the link can also arrive while Login is already open
  useEffect(() => {
    if (linkEmail) {
      setEmail(linkEmail);
      setMaskedEmail(route?.params?.maskedEmail ?? null);
    }
  }, [linkEmail, route?.params?.maskedEmail]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // errors are shown by the auth context
  const sendCode = async (value: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setMaskedEmail(await requestLoginCode(value));
      setSecondsLeft(RESEND_AFTER_SECONDS);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEmail = async () => {
    const value = email.trim();
    if (!value) {
      setEmailError(`${t('form.email.required')}`);
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError(`${t('form.email.pattern')}`);
      return;
    }
    setEmailError(undefined);
    await sendCode(value);
  };

  const onResend = async () => {
    if (secondsLeft > 0 || isLoading) {
      return;
    }
    setCode('');
    setCodeError(false);
    if (await sendCode(email.trim())) {
      Toast.show({ type: 'success', text1: `${t('code.resent')}` });
    }
  };

  const onSubmitCode = async (value: string) => {
    if (value.length !== CODE_LENGTH || isVerifying) {
      return;
    }
    try {
      setIsVerifying(true);
      setCodeError(false);
      // logs in: the Router switches to the private routes
      await loginWithCode(value);
    } catch (error: any) {
      if (error?.createUser) {
        navigation.navigate('create-user');
        return;
      }
      // wrong or expired code: the auth context shows why; let the user type it again
      setCodeError(true);
      setCode('');
      codeRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const onChangeEmail = () => {
    setCode('');
    setCodeError(false);
    setMaskedEmail(null);
  };

  const openMailApp = () => {
    Linking.openURL('message://').catch(() => undefined);
  };

  if (maskedEmail) {
    return (
      <View style={styles.screen}>
        {/* compact while typing, so it fits above the keyboard without scrolling the back button away */}
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.l, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton onPress={onChangeEmail} label={`${t('code.change_email')}`} />
          {!keyboardOpen && (
            <Enter style={styles.tileWrap}>
              <MailTile />
            </Enter>
          )}
          <Enter index={1} style={styles.gap8}>
            <VText variant="largeTitle" accessibilityRole="header">
              {t('code.title')}
            </VText>
            <VText variant="sub">
              {t('code.sent_to')}
              <VText variant="sub" color={colors.ink} style={styles.bold}>
                {maskedEmail}
              </VText>
              {t('code.valid_for')}
            </VText>
          </Enter>
          {Platform.OS === 'ios' && !keyboardOpen && (
            <Enter index={2}>
              <VButton variant="navy" label={t('code.open_mail')} onPress={openMailApp} />
            </Enter>
          )}
          <Enter index={3} style={styles.divider}>
            <View style={styles.rule} />
            <VText variant="cap">{t('code.or_type')}</VText>
            <View style={styles.rule} />
          </Enter>
          <Enter index={3}>
            <CodeInput
              ref={codeRef}
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeError(false);
              }}
              onComplete={onSubmitCode}
              disabled={isVerifying}
              error={codeError}
              accessibilityLabel={`${t('form.code.label')}`}
              testID="login-code"
            />
          </Enter>
          <Enter index={4} style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <VText variant="cap">{t('code.resend_in', { seconds: secondsLeft })}</VText>
            ) : (
              <Pressable onPress={onResend} hitSlop={8} disabled={isLoading} testID="login-resend">
                <VText variant="cap" color={colors.ink} style={styles.underline}>
                  {t('code.resend')}
                </VText>
              </Pressable>
            )}
            <Pressable onPress={onChangeEmail} hitSlop={8}>
              <VText variant="label" style={styles.underline}>
                {t('code.other_email')}
              </VText>
            </Pressable>
          </Enter>
          <VText variant="cap">{t('code.not_received')}</VText>
        </ScrollView>
        <StatusBarScrim color={colors.white} />
        {isVerifying && (
          <View style={styles.verifying} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.navy} />
            <VText variant="sub">{t('code.verifying')}</VText>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.l, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {navigation.canGoBack() && (
          <BackButton onPress={navigation.goBack} label={`${t('general:back')}`} />
        )}
        <Enter style={styles.gap8}>
          <VText variant="largeTitle" accessibilityRole="header">
            {t('title')}
          </VText>
          <VText variant="sub">{t('paragraph')}</VText>
        </Enter>
        {isMigrationNoticeActive() && <VText variant="cap">{t('migration_notice')}</VText>}
        <Enter index={1}>
          <VTextField
            label={t('form.email.label')}
            placeholder={t('form.email.placeholder')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(undefined);
            }}
            error={emailError}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={onSubmitEmail}
            testID="login-email-input"
          />
        </Enter>
        <Enter index={2}>
          <VButton
            label={t('submit')}
            onPress={onSubmitEmail}
            loading={isLoading}
            testID="login-send"
          />
        </Enter>
      </ScrollView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, paddingHorizontal: 24, gap: 20 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileWrap: { marginTop: 8 },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gap8: { gap: 8 },
  bold: { fontFamily: fonts.bold },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  underline: { textDecorationLine: 'underline' },
  verifying: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
