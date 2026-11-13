import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { springTo } from '../../design/motion';

/** Prototype `.press:active{transform:scale(.965)}` with the snappy spring. */
export const PRESSED_SCALE = 0.965;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. Defaults to the prototype value (.965). */
  pressedScale?: number;
}

/**
 * Pressable that shrinks slightly while pressed and springs back (snappy spring). Reduce Motion: no
 * scale.
 */
export const PressableScale = ({
  style,
  pressedScale = PRESSED_SCALE,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableScaleProps) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...props}
      onPressIn={(event) => {
        if (!reducedMotion) {
          scale.value = springTo(pressedScale, 'snappy', false);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = springTo(1, 'snappy', reducedMotion);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
};

export default PressableScale;
