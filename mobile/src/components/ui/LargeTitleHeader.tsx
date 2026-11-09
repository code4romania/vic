import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VText } from './VText';
import { colors, spacing } from '../../common/theme/tokens';

export interface LargeTitleHeaderProps {
  title: string;
  /** Scroll offset of the screen; when set, a compact title fades in once the large one scrolls away. */
  scrollY?: SharedValue<number>;
  right?: ReactNode;
  left?: ReactNode;
}

const COLLAPSE_AT = 44;

/**
 * Screen title in the iOS large-title style (Titillium 32). With `scrollY` it also renders a
 * compact bar (title 17 + hairline) that fades in while the large title scrolls under it.
 */
export const LargeTitleHeader = ({ title, scrollY, right, left }: LargeTitleHeaderProps) => {
  const insets = useSafeAreaInsets();

  const compactStyle = useAnimatedStyle(() => {
    const y = scrollY ? scrollY.value : 0;
    return {
      opacity: interpolate(y, [COLLAPSE_AT - 12, COLLAPSE_AT], [0, 1], Extrapolation.CLAMP),
    };
  });
  const largeStyle = useAnimatedStyle(() => {
    const y = scrollY ? scrollY.value : 0;
    return {
      opacity: interpolate(y, [0, COLLAPSE_AT], [1, 0], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(y, [-80, 0], [1.08, 1], Extrapolation.CLAMP) }],
    };
  });

  return (
    <>
      {scrollY && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.compact,
            { paddingTop: insets.top, height: insets.top + 44 },
            compactStyle,
          ]}
        >
          <VText variant="h3" style={styles.compactTitle} numberOfLines={1}>
            {title}
          </VText>
        </Animated.View>
      )}
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
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: { fontSize: 17 },
  large: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.m,
    gap: spacing.m,
  },
  titleWrap: { flex: 1, transformOrigin: 'left' },
});
