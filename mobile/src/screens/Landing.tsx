import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { LoginHero } from '../components/auth/LoginHero';
import { SocialButton } from '../components/auth/SocialButton';
import { VicLogo } from '../components/brand/VicLogo';
import { Sheet } from '../components/ui/Sheet';
import { AppText } from '../design/components/Text';
import { Button } from '../design/components/Button';
import { TextField } from '../design/components/TextField';
import { enter } from '../design/motion';
import { MailIcon } from '../design/icons';
import { palette } from '../design/tokens';
import { hasSeenOnboarding } from '../common/utils/onboarding';
import { isMigrationNoticeActive } from '../common/utils/migration-notice';
import { displayTitle } from '../layouts/displayTitle';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { InternalErrors } from '../common/errors/internal-errors.class';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * „Îndrăzneț” entry screen: navy, the masthead hexagon in yellow, a big Bricolage headline, then
 * Apple (iOS) and Google as white buttons, email as the one yellow button and the intro as the
 * outline one. Email opens a sheet, sends the 6-digit code and moves to Login for the code step.
 * Sign-up and login are the same flow (#514); there are no passwords.
 */
const Landing = ({ navigation }: any) => {
  const { isUserPending, loginWithSocial, requestLoginCode } = useAuth();
  const { t } = useTranslation('landing');
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { width, height: windowHeight } = useWindowDimensions();
  // on 667pt phones (iPhone SE) a smaller headline keeps the buttons and the footer on screen
  const compact = windowHeight < 700;
  useFocusedStatusBarStyle('light');
  const sheetRef = useRef<BottomSheetModal>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isUserPending) {
      navigation.navigate('create-user');
    }
  }, [isUserPending, navigation]);

  // first start: the intro stories, once
  useFocusEffect(
    useCallback(() => {
      let active = true;
      hasSeenOnboarding().then((seen) => {
        if (active && !seen) {
          navigation.navigate('onboarding');
        }
      });
      return () => {
        active = false;
      };
    }, [navigation]),
  );

  const onSendCode = async () => {
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError(`${t('login:form.email.pattern')}`);
      return;
    }
    setEmailError(undefined);
    try {
      setIsSending(true);
      const maskedEmail = await requestLoginCode(value);
      sheetRef.current?.dismiss();
      navigation.navigate('login', { email: value, maskedEmail });
    } catch (error) {
      const code = getAuthErrorCode(error);
      setEmailError(code ? InternalErrors.AUTH_ERRORS.getError(code) : `${t('auth:errors.login')}`);
    } finally {
      setIsSending(false);
    }
  };

  const openLink = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => undefined);
    }
  };

  // The motif hangs off the top right corner, as on the handbook masthead. White text never sits
  // on the yellow: the copy starts under the motif's lowest point.
  const motifSize = compact ? width * 0.6 : Math.min(320, width * 0.74);
  const motifTop = insets.top - motifSize * (compact ? 0.5 : 0.42);
  const motifBottom = motifTop + motifSize * 0.98;
  const logoSize = compact ? 48 : 56;
  const contentTop = insets.top + 16;
  const copyTop = Math.max(compact ? 16 : 32, motifBottom - (contentTop + logoSize) + 12);

  return (
    <View style={styles.screen}>
      <LoginHero
        size={motifSize}
        style={[styles.motif, { top: motifTop, right: -motifSize * 0.32 }]}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: contentTop, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View entering={enter(0, reduced)}>
          <VicLogo size={logoSize} dark={palette.white} />
        </Animated.View>
        <View style={[styles.copy, compact ? styles.copyCompact : null, { marginTop: copyTop }]}>
          <Animated.View entering={enter(1, reduced)}>
            <AppText variant="overline" color={palette.yellow}>
              {t('kicker')}
            </AppText>
          </Animated.View>
          <Animated.View entering={enter(2, reduced)}>
            <AppText
              variant="largeTitle"
              color={palette.white}
              accessibilityRole="header"
              style={[styles.title, compact ? styles.titleCompact : null]}
            >
              {t('title')}
            </AppText>
          </Animated.View>
          <Animated.View entering={enter(3, reduced)}>
            <AppText style={styles.subtitle}>{t('subtitle')}</AppText>
          </Animated.View>
        </View>
        <View style={styles.spacer} />
        <View style={styles.buttons}>
          {/* Apple is required next to the other social logins on iOS (App Store guideline 4.8) */}
          {Platform.OS === 'ios' && (
            <Animated.View entering={enter(4, reduced)}>
              <SocialButton
                kind="apple"
                label={t('social.apple')}
                onPress={() => loginWithSocial('apple')}
                testID="login-apple"
              />
            </Animated.View>
          )}
          <Animated.View entering={enter(5, reduced)}>
            <SocialButton
              kind="google"
              label={t('social.google')}
              onPress={() => loginWithSocial('google')}
              testID="login-google"
            />
          </Animated.View>
          <Animated.View entering={enter(6, reduced)}>
            <Button
              full
              label={t('email')}
              icon={<MailIcon size={20} color={palette.navy} strokeWidth={2.2} />}
              onPress={() => sheetRef.current?.present()}
              testID="login-email"
            />
          </Animated.View>
          <Animated.View entering={enter(7, reduced)}>
            <SocialButton
              kind="plain"
              tone="outline"
              label={t('intro')}
              onPress={() => navigation.navigate('onboarding')}
              testID="landing-intro"
            />
          </Animated.View>
        </View>
        <Animated.View entering={enter(8, reduced)} style={styles.links}>
          <Pressable
            onPress={() => openLink(process.env.EXPO_PUBLIC_TERMS_AND_CONDITIONS_LINK)}
            hitSlop={12}
            accessibilityRole="link"
            testID="landing-terms"
          >
            <AppText variant="caption" style={styles.link}>
              {t('terms_link')}
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => openLink(process.env.EXPO_PUBLIC_PRIVACY_POLICY_LINK)}
            hitSlop={12}
            accessibilityRole="link"
            testID="landing-privacy"
          >
            <AppText variant="caption" style={styles.link}>
              {t('privacy_link')}
            </AppText>
          </Pressable>
        </Animated.View>
        <AppText variant="caption" style={styles.footer}>
          {t('footer')}
        </AppText>
      </ScrollView>

      <Sheet ref={sheetRef} title={`${t('email')}`} testID="email-sheet">
        <TextField
          InputComponent={BottomSheetTextInput}
          label={t('login:form.email.label')}
          placeholder={t('login:form.email.placeholder')}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError(undefined);
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={onSendCode}
          editable={!isSending}
          testID="email-input"
        />
        <AppText variant="caption" color={palette.ink2}>
          {t('email_hint')}
        </AppText>
        {isMigrationNoticeActive() && (
          <AppText variant="caption" color={palette.ink2}>
            {t('login:migration_notice')}
          </AppText>
        )}
        <Button
          full
          label={t('send_code')}
          onPress={onSendCode}
          loading={isSending}
          testID="email-send"
        />
      </Sheet>
    </View>
  );
};

export default Landing;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.navy, overflow: 'hidden' },
  motif: { position: 'absolute' },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  copy: { gap: 12 },
  copyCompact: { gap: 8 },
  // the masthead headline: tight like the handbook's h1, with headroom for Î / ț (see displayTitle)
  title: { ...displayTitle(46, 0.92), maxWidth: 340 },
  titleCompact: displayTitle(38, 0.94),
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: theme.fontFamily.textBold,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 320,
  },
  spacer: { flex: 1, minHeight: 20 },
  buttons: { gap: 10 },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 22,
    rowGap: 8,
    marginTop: 18,
  },
  link: { color: palette.white, textDecorationLine: 'underline' },
  footer: {
    marginTop: 12,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
  },
}));
