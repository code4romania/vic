import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { LoginHero } from '../components/auth/LoginHero';
import { SocialButton } from '../components/auth/SocialButton';
import { Enter, Sheet, VButton, VText, VTextField } from '../components/ui';
import { colors, spacing } from '../common/theme/tokens';
import { hasSeenOnboarding } from '../common/utils/onboarding';
import { isMigrationNoticeActive } from '../common/utils/migration-notice';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * VIC 2.0 entry screen (canvas "Intrare"): Apple (iOS), Google, or email. Email opens a sheet,
 * sends the 6-digit code and moves to Login for the code step. Sign-up and login are the same
 * flow (#514); there are no passwords.
 */
const Landing = ({ navigation }: any) => {
  const { isUserPending, loginWithSocial, requestLoginCode } = useAuth();
  const { t } = useTranslation('landing');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
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
    } catch {
      // the auth context shows the error
    } finally {
      setIsSending(false);
    }
  };

  const openInformation = () => {
    if (process.env.EXPO_PUBLIC_INFORMATION_LINK) {
      Linking.openURL(process.env.EXPO_PUBLIC_INFORMATION_LINK).catch(() => undefined);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.l },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LoginHero />
        <Enter>
          <VText variant="largeTitle" style={styles.title} accessibilityRole="header">
            {t('title')}
          </VText>
        </Enter>
        <Enter index={1}>
          <VText variant="sub" style={styles.subtitle}>
            {t('subtitle')}
          </VText>
        </Enter>
        <Enter index={2} style={styles.buttons}>
          {/* Apple is required next to the other social logins on iOS (App Store guideline 4.8) */}
          {Platform.OS === 'ios' && (
            <SocialButton
              kind="apple"
              label={t('social.apple')}
              onPress={() => loginWithSocial('apple')}
              testID="login-apple"
            />
          )}
          <SocialButton
            kind="google"
            label={t('social.google')}
            onPress={() => loginWithSocial('google')}
            testID="login-google"
          />
          <SocialButton
            kind="email"
            label={t('email')}
            onPress={() => sheetRef.current?.present()}
            testID="login-email"
          />
        </Enter>
        <Enter index={3} style={styles.links}>
          <Pressable onPress={() => navigation.navigate('onboarding')} hitSlop={8}>
            <VText variant="cap" style={styles.link}>
              {t('intro')}
            </VText>
          </Pressable>
          <Pressable onPress={openInformation} hitSlop={8}>
            <VText variant="cap" style={styles.link}>
              {t('terms')}
            </VText>
          </Pressable>
        </Enter>
        <View style={styles.spacer} />
        <VText variant="cap" style={styles.footer}>
          {t('footer')}
        </VText>
      </ScrollView>

      <Sheet ref={sheetRef} title={`${t('email')}`} testID="email-sheet">
        <VTextField
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
        <VText variant="cap">{t('email_hint')}</VText>
        {isMigrationNoticeActive() && <VText variant="cap">{t('login:migration_notice')}</VText>}
        <VButton
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  title: { textAlign: 'center', fontSize: 30, lineHeight: 36 },
  subtitle: { textAlign: 'center', marginTop: 10, marginBottom: 24 },
  buttons: { gap: 10 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 18 },
  link: { fontSize: 13 },
  spacer: { flex: 1, minHeight: 24 },
  footer: { textAlign: 'center' },
});
