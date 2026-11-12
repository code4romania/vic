// Empty state „Îndrăzneț”: every empty state has the same shape — the VIC hexagon floating slowly,
// a Bricolage title, one sentence and at most one button — on a white card.
import React, { ReactNode, useEffect } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, palette } from '../tokens';

/** a full float cycle (up and back) */
const FLOAT_CYCLE = 3200;

/** The VIC hexagon: navy, with a yellow hexagon outline inside (56×62). */
export const VicHexagon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={(size * 62) / 56} viewBox="0 0 56 62">
    <Path d="M28 3 52 17v28L28 59 4 45V17z" fill={palette.navy} />
    <Path
      d="M28 16 40 23v15L28 45 16 38V23z"
      fill="none"
      stroke={palette.yellow}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </Svg>
);

/** The hexagon floating up 6pt and turning 4° in a 3.2 s loop; still with Reduce Motion. */
export const FloatingHexagon = ({ size = 56 }: { size?: number }) => {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(t);
      t.value = 0;
      return;
    }
    t.value = withRepeat(
      withTiming(1, { duration: FLOAT_CYCLE / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(t);
  }, [reduced, t]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * t.value }, { rotate: `${4 * t.value}deg` }],
  }));

  return (
    <Animated.View
      style={floatStyle}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <VicHexagon size={size} />
    </Animated.View>
  );
};

export interface EmptyStateProps {
  title: string;
  /** one sentence */
  description?: string;
  /** at most one button */
  action?: ReactNode;
  /** replaces the VIC hexagon (e.g. a state icon for errors) */
  icon?: ReactNode;
  /** false drops the white card (when the state sits on a card already) */
  card?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const EmptyState = ({
  title,
  description,
  action,
  icon,
  card = true,
  style,
  testID,
}: EmptyStateProps) => (
  <View testID={testID} style={[styles.empty, card ? styles.card : null, style]}>
    {icon ?? <FloatingHexagon />}
    <Text
      accessibilityRole="header"
      maxFontSizeMultiplier={fontScaleCap.display}
      style={styles.title}
    >
      {title}
    </Text>
    {!!description && (
      <Text maxFontSizeMultiplier={fontScaleCap.text} style={styles.description}>
        {description}
      </Text>
    )}
    {!!action && <View style={styles.action}>{action}</View>}
  </View>
);

export default EmptyState;

const styles = StyleSheet.create((theme) => ({
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 26,
    paddingHorizontal: theme.space.gutter,
  },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.card },
  title: {
    fontFamily: theme.fontFamily.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.44,
    color: theme.colors.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    fontFamily: theme.fontFamily.text,
    fontSize: 13.5,
    lineHeight: 19,
    color: theme.colors.ink2,
    textAlign: 'center',
    maxWidth: 260,
  },
  action: { marginTop: 8 },
}));
