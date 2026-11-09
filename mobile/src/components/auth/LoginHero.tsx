import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { VicLogo } from '../brand/VicLogo';
import { colors } from '../../common/theme/tokens';

const ORBIT = 250;
const ORB = 44;

const stroke = {
  stroke: colors.navy,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

// What VIC is about, around the logo: events, hours, documents, causes, people, places.
const orbIcons = [
  <>
    <Rect x={3} y={4} width={18} height={17} rx={2} {...stroke} />
    <Path d="M3 9h18M8 2v4M16 2v4" {...stroke} />
  </>,
  <>
    <Circle cx={12} cy={12} r={9} {...stroke} />
    <Path d="M12 7v5l3 2" {...stroke} />
  </>,
  <>
    <Path d="M14 3H6v18h12V7z" {...stroke} />
    <Path d="M14 3v4h4" {...stroke} />
  </>,
  <Path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" {...stroke} />,
  <>
    <Circle cx={9} cy={8} r={3.5} {...stroke} />
    <Path
      d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.5 2.3 3.5 5.5"
      {...stroke}
    />
  </>,
  <>
    <Path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" {...stroke} />
    <Circle cx={12} cy={10} r={2.5} {...stroke} />
  </>,
];

/** Login hero: the VIC mark with a slowly turning ring of feature icons (40s per turn). */
export const LoginHero = ({ height = 330 }: { height?: number }) => {
  const reducedMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  const logoScale = useSharedValue(reducedMotion ? 1 : 0.6);
  const logoOpacity = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    rotation.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1);
    logoScale.value = withSpring(1, { damping: 12, stiffness: 140 });
    logoOpacity.value = withTiming(1, { duration: 360 });
  }, [reducedMotion, rotation, logoScale, logoOpacity]);

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  // each orb turns back so its icon stays upright
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation.value}deg` }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View
      style={[styles.stage, { height }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={220} height={220} style={styles.glow}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.yellow} stopOpacity={0.35} />
            <Stop offset="0.7" stopColor={colors.yellow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={110} cy={110} r={110} fill="url(#glow)" />
      </Svg>
      <View style={styles.ring} />
      <Animated.View style={[styles.orbit, orbitStyle]}>
        {orbIcons.map((icon, index) => {
          const angle = (index / orbIcons.length) * 2 * Math.PI - Math.PI / 2;
          const r = ORBIT / 2;
          return (
            <Animated.View
              key={index}
              style={[
                styles.orb,
                { left: r + r * Math.cos(angle) - ORB / 2, top: r + r * Math.sin(angle) - ORB / 2 },
                orbStyle,
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                {icon}
              </Svg>
            </Animated.View>
          );
        })}
      </Animated.View>
      <Animated.View style={logoStyle}>
        <VicLogo size={88} />
      </Animated.View>
    </View>
  );
};

export default LoginHero;

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  orbit: {
    position: 'absolute',
    width: ORBIT,
    height: ORBIT,
    borderRadius: ORBIT / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  orb: {
    position: 'absolute',
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOpacity: 0.14,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
