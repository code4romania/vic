import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, View } from 'react-native';
import * as Linking from 'expo-linking';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useAuth } from '../hooks/useAuth';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { StatusBarScrim } from '../components/ui/StatusBarScrim';
import { CodeInput, CodeInputHandle } from '../components/auth/CodeInput';
import { RoundIconButton } from '../layouts/LayoutHeader';
import { AppText } from '../design/components/Text';
import { Button } from '../design/components/Button';
import { TextField } from '../design/components/TextField';
import { FloatingHexagon } from '../design/components/EmptyState';
import { enter } from '../design/motion';
import { MailIcon } from '../design/icons';
import { palette } from '../design/tokens';
import { isMigrationNoticeActive } from '../common/utils/migration-notice';
import { displayTitle } from '../layouts/displayTitle';

// A new code can be asked for once a minute (the backend answers AUTH_010 sooner).
export const RESEND_AFTER_SECONDS = 60;
export const CODE_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Navy hexagon with the yellow envelope: "check your mail". */
const MailHexagon = () => (
  <View
    style={styles.mailHex}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    <Svg width={64} height={70} viewBox="0 0 56 62" style={StyleSheet.absoluteFill}>
      <Path
        d="M28 3 52 17v28L28 59 4 45V17z"
        fill={palette.navy}
        stroke={palette.navy}
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </Svg>
    <MailIcon size={26} color={palette.yellow} strokeWidth={2.2} />
  </View>
);

/**
 * VIC 2.0 (#514): no passwords. Landing's email sheet sends the code and opens this screen on the
 * code step ("Verifică-ți emailul", six boxes, resend after 60s). Opened directly (the
 * vic://login?email= link from the web), it starts with the email step.
 * A new email gets an account too (sign-up = login); without a volunteer profile the app opens
 * CreateUser.
 * „Îndrăzneț”: paper, a 44pt round back button, a Bricolage large title, TextField inputs and one
 * yellow button pinned above the keyboard.
 */
const Login = ({ navigation, route }: any) => {
  const linkEmail: string | undefined = route?.params?.email;
  const sentTo: string | undefined = route?.params?.maskedEmail;
  const { requestLoginCode, loginWithCode } = useAuth();
  const { t } = useTranslation('login');
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
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
  // while the keyboard is open the code step drops the mail hexagon and the "open mail" button,
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

  const contentPadding = {
    paddingTop: insets.top + 12,
    paddingBottom: insets.bottom + 24,
  };

  if (maskedEmail) {
    return (
      <View style={styles.screen}>
        {/* compact while typing, so it fits above the keyboard without scrolling the back button away */}
        <ScrollView
          contentContainerStyle={[styles.content, contentPadding]}
          keyboardShouldPersistTaps="handled"
        >
          <RoundIconButton
            icon="back"
            onPress={onChangeEmail}
            accessibilityLabel={`${t('code.change_email')}`}
            testID="login-back"
            style={styles.back}
          />
          {!keyboardOpen && (
            <Animated.View entering={enter(0, reduced)}>
              <MailHexagon />
            </Animated.View>
          )}
          <Animated.View entering={enter(1, reduced)} style={styles.intro}>
            <AppText variant="largeTitle" accessibilityRole="header" style={styles.title}>
              {t('code.title')}
            </AppText>
            <AppText color={palette.ink2}>
              {t('code.sent_to')}
              <AppText variant="bodyStrong">{maskedEmail}</AppText>
              {t('code.valid_for')}
            </AppText>
          </Animated.View>
          {Platform.OS === 'ios' && !keyboardOpen && (
            <Animated.View entering={enter(2, reduced)}>
              <Button
                full
                label={t('code.open_mail')}
                icon={<MailIcon size={20} color={palette.navy} strokeWidth={2.2} />}
                onPress={openMailApp}
              />
            </Animated.View>
          )}
          <Animated.View entering={enter(3, reduced)} style={styles.divider}>
            <View style={styles.rule} />
            <AppText variant="caption" color={palette.ink2} style={styles.dividerText}>
              {t('code.or_type')}
            </AppText>
            <View style={styles.rule} />
          </Animated.View>
          <Animated.View entering={enter(4, reduced)}>
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
          </Animated.View>
          <Animated.View entering={enter(5, reduced)} style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <AppText
                variant="caption"
                color={palette.ink2}
                style={[styles.tabular, styles.shrink]}
              >
                {t('code.resend_in', { seconds: secondsLeft })}
              </AppText>
            ) : (
              <Pressable
                onPress={onResend}
                hitSlop={12}
                disabled={isLoading}
                accessibilityRole="button"
                testID="login-resend"
              >
                <AppText variant="label" style={styles.underline}>
                  {t('code.resend')}
                </AppText>
              </Pressable>
            )}
            <Pressable onPress={onChangeEmail} hitSlop={12} accessibilityRole="button">
              <AppText variant="label" style={styles.underline}>
                {t('code.other_email')}
              </AppText>
            </Pressable>
          </Animated.View>
          <AppText variant="caption" color={palette.ink2}>
            {t('code.not_received')}
          </AppText>
        </ScrollView>
        <StatusBarScrim color={palette.paper} />
        {isVerifying && (
          <View style={styles.verifying} accessibilityLiveRegion="polite">
            <FloatingHexagon size={48} />
            <AppText variant="headline">{t('code.verifying')}</AppText>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, contentPadding]}
        keyboardShouldPersistTaps="handled"
      >
        {navigation.canGoBack() && (
          <RoundIconButton
            icon="back"
            onPress={navigation.goBack}
            accessibilityLabel={`${t('general:back')}`}
            testID="login-back"
            style={styles.back}
          />
        )}
        <Animated.View entering={enter(0, reduced)} style={styles.intro}>
          <AppText variant="largeTitle" accessibilityRole="header" style={styles.title}>
            {t('title')}
          </AppText>
          <AppText color={palette.ink2}>{t('paragraph')}</AppText>
        </Animated.View>
        {isMigrationNoticeActive() && (
          <Animated.View entering={enter(1, reduced)} style={styles.notice}>
            <AppText variant="caption">{t('migration_notice')}</AppText>
          </Animated.View>
        )}
        <Animated.View entering={enter(2, reduced)}>
          <TextField
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
        </Animated.View>
      </ScrollView>
      {/* the one yellow button, pinned above the keyboard */}
      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            full
            label={t('submit')}
            onPress={onSubmitEmail}
            loading={isLoading}
            testID="login-send"
          />
        </View>
      </KeyboardStickyView>
      <StatusBarScrim color={palette.paper} />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, paddingHorizontal: theme.space.gutter + 2, gap: 20 },
  // the round button keeps its own 44pt, not the column's width
  back: { alignSelf: 'flex-start' },
  intro: { gap: 10 },
  title: displayTitle(40),
  mailHex: { width: 64, height: 70, alignItems: 'center', justifyContent: 'center' },
  notice: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.control,
    padding: theme.space.l,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.line },
  // wraps at the largest text sizes on a 320pt phone instead of pushing "Alt email" off screen
  resendRow: {
    minHeight: 44,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: 16,
    rowGap: 8,
  },
  shrink: { flexShrink: 1 },
  dividerText: { flexShrink: 1, textAlign: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
  underline: { textDecorationLine: 'underline' },
  footer: {
    paddingTop: theme.space.m,
    paddingHorizontal: theme.space.gutter + 2,
    backgroundColor: theme.colors.background,
  },
  verifying: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(244,241,233,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
}));
