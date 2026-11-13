// Hexagonul de impact „Îndrăzneț”: a rounded hexagon filled with yellow liquid up to the share of
// approved hours, with the striped „în așteptare” band above it. Two sine waves move in
// counter-phase; they stop when the screen is not visible and with Reduce Motion. The level
// rises with the gentle spring every time the screen comes into view (handbook: Umplere hexagon).
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { Canvas, Group, Path, Rect, Skia } from '@shopify/react-native-skia';
import { NavigationContext } from '@react-navigation/native';
import { toHours } from '../../common/utils/hours';
import { palette } from '../tokens';
import { springTo } from '../motion';

export type ImpactHexagonTone = 'onNavy' | 'onLight';

export interface ImpactHexagonProps {
  approved: number;
  pending: number;
  rejected: number;
  /** width in points; the height is 1.1× (default 120) */
  size?: number;
  /** 'onNavy' for the navy impact card, 'onLight' (default) on paper or white */
  tone?: ImpactHexagonTone;
  /** defaults to „42 de ore aprobate, 5 în așteptare” */
  accessibilityLabel?: string;
  testID?: string;
}

const FAST_MS = 2600;
const SLOW_MS = 3600;
// the prototype's wavelength: one crest every 120pt, whatever the size
const PERIOD = 120;
const FAST_AMP = 7;
const SLOW_AMP = 4;
// both waves are back where they started after this long, so the clock can wrap without a jump
const CLOCK_WRAP = 46800;
const COUNT_MS = 900;

/**
 * Colours per tone, from the prototype's makeHex(): on the navy Acasă card the pending stripes are
 * yellow on #012A40 over a #001A29 hexagon; on Ore (paper / white) they are navy on white over a
 * #EAE5D8 hexagon with a navy outline. The approved liquid is yellow on both.
 */
export const HEXAGON_TONES: Record<
  ImpactHexagonTone,
  { empty: string; stripeBg: string; stripe: string; liquid: string; outline: string }
> = {
  onNavy: {
    empty: palette.navy3,
    stripeBg: palette.navy2,
    stripe: palette.yellow,
    liquid: palette.yellow,
    outline: 'rgba(255,210,9,0.55)',
  },
  onLight: {
    empty: '#EAE5D8',
    stripeBg: palette.white,
    stripe: palette.navy,
    liquid: palette.yellow,
    outline: palette.navy,
  },
};

/** Romanian count: „1 oră”, „5 ore”, „42 de ore” (20+ and round hundreds take „de”). */
const roHours = (n: number) => {
  if (n === 1) {
    return '1 oră';
  }
  const rest = Math.abs(n) % 100;
  return `${n} ${n !== 0 && (rest === 0 || rest >= 20) ? 'de ' : ''}ore`;
};

export const impactHexagonLabel = (approved: number, pending: number, rejected = 0) => {
  const parts = [`${roHours(approved)} ${approved === 1 ? 'aprobată' : 'aprobate'}`];
  if (pending > 0) {
    parts.push(`${roHours(pending)} în așteptare`);
  }
  if (rejected > 0) {
    parts.push(`${roHours(rejected)} ${rejected === 1 ? 'respinsă' : 'respinse'}`);
  }
  return parts.join(', ');
};

/** Rounded pointy-top hexagon (the prototype's roundedHex): corners cut and joined by a curve. */
export const roundedHexPath = (cx: number, cy: number, r: number, corner: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  let d = '';
  for (let i = 0; i < 6; i++) {
    const p = pts[i];
    const prev = pts[(i + 5) % 6];
    const next = pts[(i + 1) % 6];
    const v1 = [prev[0] - p[0], prev[1] - p[1]];
    const v2 = [next[0] - p[0], next[1] - p[1]];
    const l1 = Math.hypot(v1[0], v1[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const a = [p[0] + (v1[0] / l1) * corner, p[1] + (v1[1] / l1) * corner];
    const b = [p[0] + (v2[0] / l2) * corner, p[1] + (v2[1] / l2) * corner];
    d += `${i ? 'L' : 'M'}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${p[0].toFixed(1)} ${p[1].toFixed(
      1,
    )} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return `${d}Z`;
};

/** A sine crest of amplitude `amp` and wavelength `period`, `width` wide; filled down to `height`. */
const waveLine = (width: number, period: number, amp: number) => {
  let d = `M0 ${amp}`;
  for (let x = 0; x <= width; x += 4) {
    d += `L${x} ${(amp + Math.sin((x / period) * Math.PI * 2) * amp).toFixed(2)}`;
  }
  return d;
};
const waveFill = (width: number, height: number, period: number, amp: number) =>
  `${waveLine(width, period, amp)}L${width} ${height}L0 ${height}Z`;

/** Stripe geometry of the prototype's pattern: 8pt tile with a 4pt bar, rotated 45°. */
export const STRIPE_PITCH = 8 * Math.SQRT2;
export const STRIPE_BAR = 4 * Math.SQRT2;

/**
 * The prototype's stripe pattern: bars 4pt wide every 8pt measured across the stripes, so 4√2
 * wide every 8√2 along a horizontal line. `rotate(45)` turns the tile's vertical bars into „/”
 * stripes (going down to the left), the same direction as the legend's StripedSquare.
 */
export const stripes = (width: number, height: number) => {
  let d = '';
  for (let x = 0; x < width + height; x += STRIPE_PITCH) {
    d += `M${x.toFixed(2)} 0L${(x + STRIPE_BAR).toFixed(2)} 0L${(x + STRIPE_BAR - height).toFixed(
      2,
    )} ${height}L${(x - height).toFixed(2)} ${height}Z`;
  }
  return d;
};

/**
 * Where the middle of a wave sits (y, from the top of the canvas) for a fill level 0–1.
 * 0 hides the wave under the bottom corner. 1 does NOT reach the top corner: the prototype maps
 * the level straight onto the height, so real numbers like 42 aprobate + 1 respinsă (98%) cover
 * the whole hexagon and it reads as a flat yellow shape. Here a full level stops `headroom`
 * below the top corner, so the crest and its motion always stay visible under the outline.
 */
export const liquidY = (
  level: number,
  top: number,
  bottom: number,
  amp: number,
  headroom: number,
) => {
  'worklet';
  const empty = bottom + amp;
  const full = top + headroom;
  const clamped = Math.min(1, Math.max(0, level));
  return empty - clamped * (empty - full);
};

const svgPath = (d: string) => Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();

/** Focus of the screen around the hexagon; always focused outside a navigator. */
const useScreenFocused = () => {
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState(() => navigation?.isFocused() ?? true);
  useEffect(() => {
    if (!navigation) {
      return undefined;
    }
    setFocused(navigation.isFocused());
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);
  return focused;
};

export const ImpactHexagon = ({
  approved,
  pending,
  rejected,
  size = 120,
  tone = 'onLight',
  accessibilityLabel,
  testID,
}: ImpactHexagonProps) => {
  const reduced = useReducedMotion();
  const focused = useScreenFocused();
  const colors = HEXAGON_TONES[tone];

  const W = size;
  const H = Math.round(size * 1.1);
  const R = W / 2 - 2;
  const period = PERIOD;
  const bandWidth = W + period + 8;
  // the hexagon's top and bottom corners, and the gap a full level keeps under the top one
  const top = H / 2 - R;
  const bottom = H / 2 + R;
  const headroom = Math.round(R * 0.4);

  const paths = useMemo(() => {
    const hex = roundedHexPath(W / 2, H / 2, R, W * 0.12);
    return {
      hex: svgPath(hex),
      approved: svgPath(waveFill(bandWidth, H * 2, period, FAST_AMP)),
      pending: svgPath(waveFill(bandWidth, H * 2, period, SLOW_AMP)),
      stripes: svgPath(stripes(bandWidth, H * 2)),
    };
  }, [W, H, R, period, bandWidth]);

  // defensive: counters can arrive as numeric strings
  const a = toHours(approved);
  const total = a + toHours(pending) + toHours(rejected);
  const approvedShare = total > 0 ? a / total : 0;
  const pendingShare = total > 0 ? toHours(pending) / total : 0;

  // 0 = empty, 1 = full; the pending band sits on top of the approved liquid
  const approvedLevel = useSharedValue(0);
  const pendingLevel = useSharedValue(0);
  const wasFocused = useRef(false);
  useEffect(() => {
    if (!focused) {
      wasFocused.current = false;
      return;
    }
    if (!wasFocused.current) {
      // refill from empty each time the screen comes into view
      approvedLevel.value = 0;
      pendingLevel.value = 0;
      wasFocused.current = true;
    }
    approvedLevel.value = springTo(approvedShare, 'gentle', reduced);
    pendingLevel.value = springTo(approvedShare + pendingShare, 'gentle', reduced);
  }, [focused, approvedShare, pendingShare, reduced, approvedLevel, pendingLevel]);

  // the only continuous motion in the app: paused off screen and with Reduce Motion
  const clock = useSharedValue(0);
  const frame = useFrameCallback((info) => {
    clock.value = (clock.value + (info.timeSincePreviousFrame ?? 16)) % CLOCK_WRAP;
  }, false);
  useEffect(() => {
    frame.setActive(focused && !reduced);
    return () => frame.setActive(false);
  }, [frame, focused, reduced]);

  const approvedTransform = useDerivedValue(() => [
    { translateX: -((clock.value / FAST_MS) % 1) * period },
    // the wave path has its middle line at y = amp
    { translateY: liquidY(approvedLevel.value, top, bottom, FAST_AMP, headroom) - FAST_AMP },
  ]);
  const pendingTransform = useDerivedValue(() => [
    // counter-phase: the slow wave runs the other way
    { translateX: -(1 - ((clock.value / SLOW_MS) % 1)) * period },
    { translateY: liquidY(pendingLevel.value, top, bottom, SLOW_AMP, headroom) - SLOW_AMP },
  ]);

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? impactHexagonLabel(approved, pending, rejected)}
      style={{ width: W, height: H }}
    >
      <Canvas style={{ width: W, height: H }} pointerEvents="none">
        <Path path={paths.hex} color={colors.empty} />
        <Group clip={paths.hex}>
          {/* no band without pending hours: its crest would show in the troughs of the liquid */}
          {pendingShare > 0 && (
            <Group transform={pendingTransform}>
              <Group clip={paths.pending}>
                <Rect x={0} y={0} width={bandWidth} height={H * 2} color={colors.stripeBg} />
                <Path path={paths.stripes} color={colors.stripe} />
              </Group>
            </Group>
          )}
          <Group transform={approvedTransform}>
            <Path path={paths.approved} color={colors.liquid} />
          </Group>
        </Group>
        <Path path={paths.hex} color={colors.outline} style="stroke" strokeWidth={3} />
      </Canvas>
    </View>
  );
};

/**
 * The number that counts up next to the hexagon, in parallel with the fill: 0 → `target` in
 * 900 ms (ease-out cubic). With Reduce Motion it shows `target` at once. Changing `replay` (for
 * example on each screen focus) counts again from 0; a new target counts from the current number.
 */
export const useCountUp = (target: number, reduced: boolean, replay?: unknown) => {
  const [value, setValue] = useState(reduced ? target : 0);
  const current = useRef(value);
  const lastReplay = useRef(replay);
  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return undefined;
    }
    let from = current.current;
    if (lastReplay.current !== replay) {
      lastReplay.current = replay;
      from = 0;
    }
    if (from === target) {
      setValue(target);
      return undefined;
    }
    const start = Date.now();
    let raf = 0;
    const step = () => {
      const x = Math.min(1, (Date.now() - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - x, 3);
      const next = Math.round(from + (target - from) * eased);
      current.current = next;
      setValue(next);
      if (x < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, replay]);
  return value;
};

export default ImpactHexagon;
