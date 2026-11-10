import React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadows } from '../theme/tokens';
import { VText } from '../../components/ui/VText';

type Tone = 'ok' | 'no' | 'neutral';

const VicToast = ({ text1, text2, tone }: { text1?: string; text2?: string; tone: Tone }) => (
  <View
    style={[styles.toast, shadows.floating]}
    accessibilityRole="alert"
    accessibilityLiveRegion="polite"
    testID={`toast-${tone}`}
  >
    <View style={[styles.dot, { backgroundColor: colors.status[tone].fg }]} />
    <View style={styles.text}>
      {!!text1 && (
        <VText variant="label" style={styles.title}>
          {text1}
        </VText>
      )}
      {!!text2 && <VText variant="cap">{text2}</VText>}
    </View>
  </View>
);

/** VIC 2.0 toasts (canvas board "Stări"): a white card with a colored dot, over the content. */
export const toastConfig = {
  success: (props: any) => <VicToast {...props} tone="ok" />,
  error: (props: any) => <VicToast {...props} tone="no" />,
  info: (props: any) => <VicToast {...props} tone="neutral" />,
};

const styles = StyleSheet.create({
  toast: {
    width: '92%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.medium },
});

/**
 * Where the toasts show. One sits at the app root; every modal screen renders its own, because on
 * iOS a native modal covers the root one (the last mounted host is the one that shows). Below the
 * notch / Dynamic Island.
 */
export const ToastHost = () => {
  const insets = useSafeAreaInsets();
  return <Toast config={toastConfig} topOffset={Math.max(insets.top, 12) + 8} />;
};
