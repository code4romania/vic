import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useReducedMotion, withDelay, withTiming } from 'react-native-reanimated';
import { motion } from '../../common/theme/tokens';

export interface EnterProps {
  /** Position in a list: each step delays the entry by 40ms (capped at 6 steps). */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  testID?: string;
}

const MAX_STAGGER_STEPS = 6;

/** Builds the canvas `vicUp` entry: fade in while moving up 10pt, 320ms, staggered by 40ms. */
export const enterUp = (index = 0) => {
  const delay = Math.min(index, MAX_STAGGER_STEPS) * motion.enter.stagger;
  const config = { duration: motion.enter.duration, easing: motion.enter.easing };
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: motion.enter.translateY }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, config)),
        transform: [{ translateY: withDelay(delay, withTiming(0, config)) }],
      },
    };
  };
};

/** Wraps content so it enters with the shared fade-up motion. Respects "Reduce motion". */
export const Enter = ({ index = 0, style, children, testID }: EnterProps) => {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View
      testID={testID}
      style={style}
      entering={reducedMotion ? undefined : enterUp(index)}
    >
      {children}
    </Animated.View>
  );
};

export default Enter;
