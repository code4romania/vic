// Screen chrome „Îndrăzneț”: the 44pt round back button of pushed screens, their header row, and
// the compact glass bar of tab screens whose large title scrolls with the content.
import React from 'react';
import { Platform, StyleSheet as RNStyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, glass } from '../../design/tokens';
import { duration, easing, spring } from '../../design/motion';
import { ChevronLeftIcon, ICON_STROKE } from '../../design/icons';
import { hit, palette } from '../../design/tokens';
import { AppText } from '../../design/components/Text';
import { PressableScale } from './PressableScale';

export interface BackButtonProps {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  /** `glass` on a navy hero: translucent white with a white chevron */
  tone?: 'white' | 'glass';
  style?: StyleProp<ViewStyle>;
}

export const BackButton = ({
  onPress,
  testID,
  accessibilityLabel,
  tone = 'white',
  style,
}: BackButtonProps) => {
  const { t } = useTranslation('general');
  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.94}
      accessibilityLabel={accessibilityLabel ?? `${t('back')}`}
      testID={testID}
      style={[styles.back, tone === 'glass' ? styles.glass : null, style]}
    >
      <ChevronLeftIcon
        size={22}
        color={tone === 'glass' ? palette.white : palette.navy}
        strokeWidth={ICON_STROKE + 0.5}
      />
    </PressableScale>
  );
};

export interface PushedHeaderProps {
  title?: string;
  onBack?: () => void;
  backTestID?: string;
  /** a node at the right end of the bar (e.g. an edit link) */
  right?: React.ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Header of a pushed screen: the round back button and a Bricolage 24 title on one row, on paper.
 * The caller adds the safe-area top padding (screens differ: some sit under a modal).
 */
export const PushedHeader = ({
  title,
  onBack,
  backTestID,
  right,
  testID,
  style,
}: PushedHeaderProps) => (
  <View style={[styles.header, style]} testID={testID}>
    {onBack && <BackButton onPress={onBack} testID={backTestID} />}
    {!!title && (
      <AppText variant="title" numberOfLines={2} accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
    )}
    {right}
  </View>
);

/** Scroll offset after which the compact glass bar shows (handbook: Antet). */
export const COMPACT_BAR_AFTER = 48;
/** Height of the compact bar under the status bar (prototype .topbar: 100 - 54). */
export const COMPACT_BAR_HEIGHT = 46;

export interface CompactTitleBarProps {
  title: string;
  scrollY: SharedValue<number>;
  testID?: string;
}

/**
 * The compact glass bar of a tab screen whose large title scrolls with the content (prototype
 * `.topbar`): paper at 72% over a blur, a Bricolage 17 title and a 1pt hairline. Once the content
 * passes 48pt it fades in (200 ms, standard easing) and the title rises 6pt into place with the
 * snappy spring; scrolling back above 48pt reverses it. Reduce Motion: a 150 ms fade, no rise.
 *
 * Render it AFTER the scroll view / list (it is absolutely positioned at the top, zIndex 10), never
 * inside a list header: it must not scroll. It is hidden from VoiceOver (the large title is the
 * header). Pair it with `useLargeTitleCollapse(scrollY)` on the large title in the content.
 */
export const CompactTitleBar = ({ title, scrollY, testID }: CompactTitleBarProps) => {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const shown = useDerivedValue(() => (scrollY.value > COMPACT_BAR_AFTER ? 1 : 0));
  const opacity = useDerivedValue(() =>
    withTiming(shown.value, {
      duration: reduced ? duration.reduced : 200,
      easing: easing.standard,
    }),
  );
  const rise = useDerivedValue(() =>
    reduced ? 0 : withSpring(shown.value ? 0 : 6, spring.snappy),
  );
  const barStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const titleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: rise.value }] }));
  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.compact,
        { paddingTop: insets.top, height: insets.top + COMPACT_BAR_HEIGHT },
        barStyle,
      ]}
    >
      {Platform.OS === 'ios' && (
        <BlurView intensity={glass.blurIntensity} tint="light" style={RNStyleSheet.absoluteFill} />
      )}
      <View style={[RNStyleSheet.absoluteFill, styles.compactTint]} />
      <Animated.View style={titleStyle}>
        <AppText
          numberOfLines={1}
          maxFontSizeMultiplier={fontScaleCap.display}
          style={styles.compactTitle}
        >
          {title}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
};

/**
 * The large title's own collapse (prototype `.lt`): between 10 and 80pt of scroll it shrinks to
 * 88% (anchored bottom-left) and fades to 10%, while the compact bar takes over at 48pt. Apply the
 * returned style to an Animated.View around the large title. Reduce Motion: fade only.
 */
export const useLargeTitleCollapse = (scrollY?: SharedValue<number>) => {
  const reduced = useReducedMotion();
  return useAnimatedStyle(() => {
    const y = scrollY ? scrollY.value : 0;
    const p = interpolate(y, [10, 80], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: 1 - p * 0.9,
      transform: [{ scale: reduced ? 1 : 1 - p * 0.12 }],
    };
  });
};

export default BackButton;

const styles = StyleSheet.create((theme) => ({
  back: {
    width: hit.min,
    height: hit.min,
    borderRadius: hit.min / 2,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: { backgroundColor: 'rgba(255,255,255,0.16)' },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.m,
    paddingHorizontal: theme.space.gutter,
    paddingVertical: theme.space.s,
  },
  title: { flex: 1 },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  // Android has no live blur outside a BlurTargetView: a denser paper keeps the title readable
  compactTint: {
    backgroundColor: Platform.OS === 'ios' ? theme.colors.topBarTint : 'rgba(244,241,233,0.96)',
  },
  compactTitle: {
    fontFamily: theme.fontFamily.display,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.17,
  },
}));
