import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

// The last over-the-air update for 1.0.x (issue 18): VIC moved to its own login and this build can no
// longer sign in, so every screen tells the user to install the new version from the store.
// Hard-coded on purpose: no backend call, no version check, nothing native.
const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/ro/app/vic/id6474194051',
  default: 'https://play.google.com/store/apps/details?id=org.commitglobal.vic',
});

const UpdateNowBanner = () => {
  const { t } = useTranslation('update_now');
  const insets = useSafeAreaInsets();

  const onUpdate = () => {
    Linking.openURL(STORE_URL).catch(() => undefined);
  };

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 12 }]} accessibilityRole="alert">
      <View style={styles.texts}>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.title} category="s1">
          {`${t('title')}`}
        </Text>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.message} category="p2">
          {`${t('message')}`}
        </Text>
      </View>
      <Pressable onPress={onUpdate} accessibilityRole="button" style={styles.button}>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.buttonText} category="s2">
          {`${t('update')}`}
        </Text>
      </Pressable>
    </View>
  );
};

export default UpdateNowBanner;

const styles = StyleSheet.create({
  // stacked: the text gets the full width, the button its own row (a bigger target)
  banner: {
    backgroundColor: '#280056',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },
  texts: { gap: 2 },
  title: { color: '#FFFFFF', textAlign: 'center' },
  message: { color: '#E5E7EB', textAlign: 'center' },
  button: {
    backgroundColor: '#FBBF24',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#1F2937', fontFamily: 'roboto-bold', fontSize: 16, lineHeight: 20 },
});
