// Screen chrome „Îndrăzneț”: the 44pt round back button of pushed screens, their header row, and
// the compact glass bar of tab screens whose large title scrolls with the content.
import React from 'react';
import { StyleSheet as RNStyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { glass } from '../../design/tokens';
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
      <AppText variant="title" numberOfLines={1} accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
    )}
    {right}
  </View>
);

// the compact bar appears after 48pt of scroll (handbook: Antet), like LargeTitleHeader
const COLLAPSE_AT = 48;

export interface CompactTitleBarProps {
  title: string;
  scrollY: SharedValue<number>;
  testID?: string;
}

/**
 * The compact glass bar of a tab screen whose large title is part of the scroll content: paper at
 * 72% over a blur, a Bricolage 17 title and a hairline. It fades in after 48pt of scroll while the
 * title rises 6pt into place. Render it after the scroll view.
 */
export const CompactTitleBar = ({ title, scrollY, testID }: CompactTitleBarProps) => {
  const insets = useSafeAreaInsets();
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_AT - 16, COLLAPSE_AT],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [COLLAPSE_AT - 16, COLLAPSE_AT + 8],
          [6, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.compact, { paddingTop: insets.top, height: insets.top + 44 }, barStyle]}
    >
      <BlurView intensity={glass.blurIntensity} tint="light" style={RNStyleSheet.absoluteFill} />
      <View style={[RNStyleSheet.absoluteFill, styles.compactTint]} />
      <Animated.View style={titleStyle}>
        <AppText numberOfLines={1} maxFontSizeMultiplier={1.15} style={styles.compactTitle}>
          {title}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  compactTint: { backgroundColor: theme.colors.topBarTint },
  compactTitle: {
    fontFamily: theme.fontFamily.display,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
}));
