import React, { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, palette } from '../../design/tokens';
import { duration, easing, spring } from '../../design/motion';
import { AppText } from '../../design/components/Text';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const HEX_W = 120;
const HEX_H = 132;
const CHECK_LENGTH = 40;

// Handbook motion catalog „Trimitere reușită”: where each of the six sparks flies to.
const SPARKS = [
  { x: -90, y: -60 },
  { x: 95, y: -50 },
  { x: -80, y: 60 },
  { x: 85, y: 70 },
  { x: 0, y: -100 },
  { x: 10, y: 100 },
];

const sparkPath = 'M6 0 L12 3.25 L12 9.75 L6 13 L0 9.75 L0 3.25 Z';

const Spark = ({ x, y, progress }: { x: number; y: number; progress: { value: number } }) => {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p <= 0 ? 0 : 1 - p,
      transform: [
        { translateX: x * p },
        { translateY: y * p },
        { scale: interpolate(p, [0, 1], [0.4, 1]) },
        { rotate: `${90 * p}deg` },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.spark, style]}>
      <Svg width={12} height={13} viewBox="0 0 12 13">
        <Path d={sparkPath} fill={palette.yellow} />
      </Svg>
    </Animated.View>
  );
};

export interface SubmitSuccessProps {
  title: string;
  description: string;
  testID?: string;
}

/**
 * „Trimis spre aprobare” (prototype `.done`): the yellow hexagon with a navy stroke pops in with a
 * turn on the bouncy spring, the check draws itself (420 ms after 360 ms) and six small yellow
 * hexagons burst outward (900 ms, emphasized). With Reduce Motion it only fades in.
 */
export const SubmitSuccess = ({ title, description, testID }: SubmitSuccessProps) => {
  const reduced = useReducedMotion();
  const shown = useSharedValue(0);
  const pop = useSharedValue(reduced ? 1 : 0);
  const check = useSharedValue(reduced ? 0 : CHECK_LENGTH);
  const burst = useSharedValue(0);

  useEffect(() => {
    shown.value = withTiming(1, { duration: reduced ? duration.reduced : 200 });
    if (reduced) {
      return;
    }
    pop.value = withSpring(1, spring.bouncy);
    check.value = withDelay(360, withTiming(0, { duration: 420, easing: easing.standard }));
    burst.value = withDelay(120, withTiming(1, { duration: 900, easing: easing.emphasized }));
  }, [reduced, shown, pop, check, burst]);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${title}. ${description}`);
  }, [title, description]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: shown.value }));
  const hexStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pop.value, [0, 0.16], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(pop.value, [0, 1], [0.2, 1]) },
      { rotate: `${interpolate(pop.value, [0, 1], [-30, 0])}deg` },
    ],
  }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: check.value }));

  return (
    <Animated.View style={[styles.done, containerStyle]} testID={testID}>
      <View style={styles.mark} accessibilityElementsHidden importantForAccessibility="no">
        <Animated.View style={hexStyle}>
          <Svg width={HEX_W} height={HEX_H} viewBox={`0 0 ${HEX_W} ${HEX_H}`}>
            <Path
              d="M60 6 112 36v60L60 126 8 96V36z"
              fill={palette.yellow}
              stroke={palette.navy}
              strokeWidth={6}
              strokeLinejoin="round"
            />
            <AnimatedPath
              d="M38 68l15 15 30-32"
              fill="none"
              stroke={palette.navy}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_LENGTH}
              animatedProps={checkProps}
            />
          </Svg>
        </Animated.View>
        {!reduced && SPARKS.map((s, i) => <Spark key={i} x={s.x} y={s.y} progress={burst} />)}
      </View>
      <AppText
        variant="title"
        accessibilityRole="header"
        maxFontSizeMultiplier={fontScaleCap.display}
        style={styles.title}
      >
        {title}
      </AppText>
      <AppText variant="body" color={palette.ink2} style={styles.description}>
        {description}
      </AppText>
    </Animated.View>
  );
};

export default SubmitSuccess;

const styles = StyleSheet.create((theme) => ({
  done: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 30,
    backgroundColor: theme.colors.paper,
  },
  mark: { width: HEX_W, height: HEX_H },
  spark: {
    position: 'absolute',
    left: HEX_W / 2 - 6,
    top: HEX_H / 2 - 6.5,
  },
  title: {
    marginTop: 6,
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -1.1,
    textAlign: 'center',
  },
  description: {
    fontFamily: theme.fontFamily.text,
    textAlign: 'center',
    maxWidth: 280,
  },
}));
