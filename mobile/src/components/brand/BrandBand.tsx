import React, { createContext, ReactNode, useContext } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import {
  EdgeInsets,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../design/components/Text';
import { fontScaleCap, palette } from '../../design/tokens';

export const CODE4RO_URL = 'https://code4.ro';
const BAND_HEIGHT = 32;

// the window's real insets, for what draws over the band (a full-screen modal)
const WindowInsetsContext = createContext<EdgeInsets | null>(null);

/**
 * "Un proiect Code for Romania/Commit Global" with the logo, on top of every screen (Maria,
 * 27 Nov 2026). The band takes the status bar area; the screens below it get a top inset of 0,
 * so their own `insets.top` padding no longer adds a second status-bar gap.
 */
export const BrandBandFrame = ({ children }: { children: ReactNode }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('general');
  return (
    <WindowInsetsContext.Provider value={insets}>
      <View style={styles.frame}>
        <View style={[styles.band, { paddingTop: insets.top }]} testID="brand-band">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${t('brand_band')}`}
            onPress={() => Linking.openURL(CODE4RO_URL)}
            style={styles.row}
          >
            <Image
              source={require('../../assets/images/code4ro-commit-global.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <AppText
              variant="caption"
              numberOfLines={1}
              maxFontSizeMultiplier={fontScaleCap.tabLabel}
              style={styles.text}
            >
              {t('brand_band')}
            </AppText>
          </Pressable>
        </View>
        <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
          <View style={styles.content}>{children}</View>
        </SafeAreaInsetsContext.Provider>
      </View>
    </WindowInsetsContext.Provider>
  );
};

/** For what covers the whole window, band included (an RN Modal, a full-screen modal on iOS). */
export const WithWindowInsets = ({ children }: { children: ReactNode }) => {
  const insets = useContext(WindowInsetsContext);
  if (!insets) {
    return <>{children}</>;
  }
  return <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>;
};

const styles = StyleSheet.create({
  frame: { flex: 1, backgroundColor: palette.paper },
  band: {
    backgroundColor: palette.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  row: {
    height: BAND_HEIGHT,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: { width: 89, height: 16 },
  text: { flexShrink: 1, fontSize: 11, lineHeight: 15, color: palette.ink },
  content: { flex: 1 },
});

export default BrandBandFrame;
