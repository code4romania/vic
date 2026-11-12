// The VIC hexagon motif of the handbook masthead (a thick hexagon ring around a solid hexagon), in
// yellow on the navy entry screens. It settles in with the gentle spring and then floats slowly
// (6 s, 3°); with Reduce Motion it is still.
import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
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
import { palette } from '../../design/tokens';
import { springTo } from '../../design/motion';

const FLOAT_CYCLE = 6000;

export interface HexMotifProps {
  /** width of the drawing; the height follows the 400×400 viewBox */
  size?: number;
  color?: string;
  /** the solid hexagon in the middle */
  coreColor?: string;
  style?: StyleProp<ViewStyle>;
}

/** The masthead drawing, static. */
export const HexMotifShape = ({
  size = 320,
  color = palette.yellow,
  coreColor = palette.yellow,
}: Omit<HexMotifProps, 'style'>) => (
  <Svg width={size} height={size} viewBox="0 0 400 400">
    <Path
      d="M200 20 356 110v180L200 380 44 290V110z"
      fill="none"
      stroke={color}
      strokeWidth={44}
      strokeLinejoin="round"
    />
    <Path d="M200 120 270 160v80l-70 40-70-40v-80z" fill={coreColor} />
  </Svg>
);

/** The masthead hexagon, animated: enters (scale .86 → 1, -8° → 0) and floats. Decorative. */
export const LoginHero = ({ size = 320, color, coreColor, style }: HexMotifProps) => {
  const reduced = useReducedMotion();
  const shown = useSharedValue(reduced ? 1 : 0);
  const float = useSharedValue(0);

  useEffect(() => {
    shown.value = springTo(1, 'gentle', reduced);
    if (reduced) {
      cancelAnimation(float);
      float.value = 0;
      return undefined;
    }
    float.value = withRepeat(
      withTiming(1, { duration: FLOAT_CYCLE / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(float);
  }, [reduced, shown, float]);

  const motion = useAnimatedStyle(() => ({
    // visible from the first frame: only scale and rotation animate in
    transform: [
      { translateY: -8 * float.value },
      { rotate: `${-8 * (1 - shown.value) + 3 * float.value}deg` },
      { scale: 0.86 + 0.14 * shown.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[style, motion]}
    >
      <HexMotifShape size={size} color={color} coreColor={coreColor} />
    </Animated.View>
  );
};

export default LoginHero;
