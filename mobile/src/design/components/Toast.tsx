// Toast „Îndrăzneț”: one global instance. A navy pill with white Manrope 800 text and a 28pt
// circle with an icon, dropping from the Dynamic Island (scale 0.9 → 1, spring snappy) and leaving
// after 2.2 s. react-native-toast-message stays the queue, so `Toast.show({ type, text1, text2 })`
// keeps working everywhere; only the renderers and the host are ours.
import React, { useEffect } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import Toast, { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { elevation, fontScaleCap, palette } from '../tokens';
import { duration, springTo } from '../motion';
import { haptics } from '../haptics';
import { AlertIcon, CheckIcon, ICON_STROKE, InfoIcon } from '../icons';

/** ok = success, no = error, neutral = info (the testIDs `toast-ok|no|neutral` stay) */
export type ToastTone = 'ok' | 'no' | 'neutral';

const TONE = {
  ok: { circle: palette.yellow, ink: palette.navy, Icon: CheckIcon },
  no: { circle: palette.red, ink: palette.white, Icon: AlertIcon },
  neutral: { circle: palette.yellow, ink: palette.navy, Icon: InfoIcon },
} as const;

export interface ToastViewProps {
  text1?: string;
  text2?: string;
  tone: ToastTone;
  /** false while the queue hides it; the entrance replays each time it turns true */
  isVisible?: boolean;
  onPress?: () => void;
}

export const ToastView = ({ text1, text2, tone, isVisible = true, onPress }: ToastViewProps) => {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0.9);
  const lift = useSharedValue(reduced ? 0 : -12);
  const { circle, ink, Icon } = TONE[tone];

  useEffect(() => {
    if (!isVisible) {
      scale.value = reduced ? 1 : 0.9;
      lift.value = reduced ? 0 : -12;
      return;
    }
    scale.value = springTo(1, 'snappy', reduced);
    lift.value = springTo(0, 'snappy', reduced);
    if (tone === 'ok') {
      haptics.success();
    }
    const message = [text1, text2].filter(Boolean).join('. ');
    if (message) {
      AccessibilityInfo.announceForAccessibility(message);
    }
    // replay on a new message too, not only on visibility
  }, [isVisible, text1, text2, tone, reduced, scale, lift]);

  const motionStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, motionStyle]} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        style={[styles.pill, elevation.float]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={[text1, text2].filter(Boolean).join('. ')}
        testID={`toast-${tone}`}
      >
        <View style={[styles.circle, { backgroundColor: circle }]}>
          <Icon size={16} color={ink} strokeWidth={ICON_STROKE + 0.4} />
        </View>
        <View style={styles.text}>
          {!!text1 && (
            <Text maxFontSizeMultiplier={fontScaleCap.text} style={styles.title}>
              {text1}
            </Text>
          )}
          {!!text2 && (
            <Text maxFontSizeMultiplier={fontScaleCap.text} style={styles.subtitle}>
              {text2}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const render = (tone: ToastTone) => (params: Partial<ToastConfigParams<unknown>>) => (
  <ToastView
    text1={params.text1}
    text2={params.text2}
    isVisible={params.isVisible ?? true}
    onPress={params.onPress}
    tone={tone}
  />
);

/** Renderers for `Toast.show({ type: 'success' | 'error' | 'info' })`. */
export const toastConfig = {
  success: render('ok'),
  error: render('no'),
  info: render('neutral'),
} satisfies ToastConfig;

/** Toast drops from the Dynamic Island: safe area top + 4. */
export const TOAST_GAP = 4;

/**
 * Where toasts show. One sits at the app root; every modal screen renders its own, because on iOS
 * a native modal covers the root one (the last mounted host is the one that shows).
 */
export const ToastHost = () => {
  const insets = useSafeAreaInsets();
  return (
    <Toast
      config={toastConfig}
      topOffset={insets.top + TOAST_GAP}
      visibilityTime={duration.toast}
    />
  );
};

export default ToastView;

const styles = StyleSheet.create((theme) => ({
  wrap: { width: '100%', alignItems: 'center', paddingHorizontal: theme.space.gutter },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 420,
    minHeight: 48,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 22,
    backgroundColor: theme.colors.navy,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flexShrink: 1, gap: 1 },
  title: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.white,
  },
  subtitle: {
    fontFamily: theme.fontFamily.text,
    fontSize: 12.5,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.75)',
  },
}));
