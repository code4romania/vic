import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../../common/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. Defaults to the canvas value (.98). */
  pressedScale?: number;
}

/** Pressable that shrinks slightly while pressed (canvas: `.btn:active{transform:scale(.98)}`). */
export const PressableScale = ({
  style,
  pressedScale = motion.press.scale,
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
          scale.value = withTiming(pressedScale, { duration: motion.press.duration });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: motion.press.duration });
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
};

export default PressableScale;
