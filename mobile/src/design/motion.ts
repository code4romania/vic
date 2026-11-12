// src/design/motion.ts — the single source for motion. All motion comes from four springs.
import {
  FadeIn,
  FadeInDown,
  FadeOut,
  WithSpringConfig,
  Easing,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export const spring = {
  // presses, tab bar lens, segmented thumb, stepper, toast (~470 ms, 2% overshoot)
  snappy: { stiffness: 380, damping: 30, mass: 1 },
  // list entrances, hexagon fill, progress bars (~570 ms, no overshoot)
  gentle: { stiffness: 170, damping: 24, mass: 1 },
  // sheets, tab bar minimise (~490 ms)
  sheet: { stiffness: 260, damping: 30, mass: 1 },
  // success moments only (~1 s, 18% overshoot)
  bouncy: { stiffness: 220, damping: 14, mass: 1 },
} as const satisfies Record<string, WithSpringConfig>;

export type SpringName = keyof typeof spring;

export const duration = {
  exit: 180,
  enter: 360,
  push: 420,
  stagger: 40,
  // Reduce Motion: springs become 150 ms fades
  reduced: 150,
  toast: 2200,
} as const;

/** At most 8 stagger steps; later items enter at once. */
export const MAX_STAGGER = 8;

export const easing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  emphasized: Easing.bezier(0.05, 0.7, 0.1, 1),
  exit: Easing.bezier(0.3, 0, 1, 1),
} as const;

/** Spring to `to`, or jump there (a 150 ms timing) with Reduce Motion. */
export const springTo = (to: number, name: SpringName, reduced: boolean) => {
  'worklet';
  return reduced ? withTiming(to, { duration: duration.reduced }) : withSpring(to, spring[name]);
};

/** List / screen entrance: lift 16pt with the gentle spring, staggered by 40 ms. */
export const enter = (i: number, reduced = false) =>
  reduced
    ? FadeIn.duration(duration.reduced)
    : FadeInDown.springify()
        .stiffness(spring.gentle.stiffness)
        .damping(spring.gentle.damping)
        .delay(Math.min(i, MAX_STAGGER) * duration.stagger);

export const exit = (reduced = false) =>
  FadeOut.duration(reduced ? duration.reduced : duration.exit);
