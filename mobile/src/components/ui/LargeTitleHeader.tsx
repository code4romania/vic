import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VText } from './VText';
import { colors, spacing } from '../../common/theme/tokens';
import { glass, lightColors } from '../../design/tokens';

export interface LargeTitleHeaderProps {
  title: string;
  /** Scroll offset of the screen; when set, a compact title fades in once the large one scrolls away. */
  scrollY?: SharedValue<number>;
  right?: ReactNode;
  left?: ReactNode;
  /**
   * Render the compact glass bar here (default true). Inside a FlatList header the bar would scroll
   * away with the content: pass false and render `LargeTitleCompactBar` beside the list instead.
   */
  compact?: boolean;
}

// the compact glass bar appears after 48pt of scroll (handbook: Antet)
const COLLAPSE_AT = 48;

/** The compact glass bar alone, pinned to the top of the screen (fades in after 48pt of scroll). */
export const LargeTitleCompactBar = ({
  title,
  scrollY,
}: {
  title: string;
  scrollY: SharedValue<number>;
}) => {
  const insets = useSafeAreaInsets();
  const compactStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [COLLAPSE_AT - 16, COLLAPSE_AT], [0, 1], Extrapolation.CLAMP),
    };
  });
  const compactTitleStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      transform: [
        {
          translateY: interpolate(
            y,
            [COLLAPSE_AT - 16, COLLAPSE_AT + 8],
            [6, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.compact, { paddingTop: insets.top, height: insets.top + 44 }, compactStyle]}
    >
      <BlurView intensity={glass.blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.compactTint]} />
      <Animated.View style={compactTitleStyle}>
        <VText variant="h2" style={styles.compactTitle} numberOfLines={1}>
          {title}
        </VText>
      </Animated.View>
    </Animated.View>
  );
};

/**
 * „Îndrăzneț” large title (Bricolage 44) in the content. With `scrollY` it also renders a compact
 * glass bar (paper at 72% over a blur, Bricolage 17 title, hairline) that fades in after 48pt of
 * scroll while the large title shrinks and fades away; the compact title rises 6pt into place.
 */
export const LargeTitleHeader = ({
  title,
  scrollY,
  right,
  left,
  compact = true,
}: LargeTitleHeaderProps) => {
  const insets = useSafeAreaInsets();

  const largeStyle = useAnimatedStyle(() => {
    const y = scrollY ? scrollY.value : 0;
    return {
      opacity: interpolate(y, [0, COLLAPSE_AT], [1, 0], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(y, [-80, 0, COLLAPSE_AT], [1.08, 1, 0.92], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <>
      {scrollY && compact && <LargeTitleCompactBar title={title} scrollY={scrollY} />}
      <View style={[styles.large, { paddingTop: insets.top + spacing.m }]}>
        {left}
        <Animated.View style={[styles.titleWrap, largeStyle]}>
          <VText variant="largeTitle" accessibilityRole="header" numberOfLines={1}>
            {title}
          </VText>
        </Animated.View>
        {right}
      </View>
    </>
  );
};

export default LargeTitleHeader;

const styles = StyleSheet.create({
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTint: { backgroundColor: lightColors.topBarTint },
  compactTitle: { fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  large: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.m,
    gap: spacing.m,
  },
  titleWrap: { flex: 1, transformOrigin: 'left bottom' },
});
