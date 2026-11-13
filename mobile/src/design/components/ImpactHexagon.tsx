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
// both waves are back where they started after this long, so the clock can wrap without a jump
const CLOCK_WRAP = 46800;
const COUNT_MS = 900;

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

/** 45° stripes, 4pt yellow every 8pt, covering width × height. */
const stripes = (width: number, height: number) => {
  let d = '';
  for (let x = -height; x < width; x += 8) {
    d += `M${x} 0L${x + 4} 0L${x + 4 + height} ${height}L${x + height} ${height}Z`;
  }
  return d;
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

  const W = size;
  const H = Math.round(size * 1.1);
  const period = Math.round(size * 1.1);
  const bandWidth = W + period + 8;

  const paths = useMemo(() => {
    const hex = roundedHexPath(W / 2, H / 2, W / 2 - 2, W * 0.12);
    return {
      hex: svgPath(hex),
      approved: svgPath(waveFill(bandWidth, H * 2, period, 7)),
      pending: svgPath(waveFill(bandWidth, H * 2, period, 4)),
      crest: svgPath(waveLine(bandWidth, period, 4)),
      stripes: svgPath(stripes(bandWidth, H * 2)),
    };
  }, [W, H, period, bandWidth]);

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
    { translateY: H * (1 - approvedLevel.value) - 5 },
  ]);
  const pendingTransform = useDerivedValue(() => [
    // counter-phase: the slow wave runs the other way
    { translateX: -(1 - ((clock.value / SLOW_MS) % 1)) * period },
    { translateY: H * (1 - pendingLevel.value) - 4 },
  ]);

  const onNavy = tone === 'onNavy';
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? impactHexagonLabel(approved, pending, rejected)}
      style={{ width: W, height: H }}
    >
      <Canvas style={{ width: W, height: H }} pointerEvents="none">
        <Path path={paths.hex} color={onNavy ? palette.navy3 : '#EAE5D8'} />
        <Group clip={paths.hex}>
          <Group transform={pendingTransform}>
            <Group clip={paths.pending}>
              <Rect x={0} y={0} width={bandWidth} height={H * 2} color={palette.white} />
              <Path path={paths.stripes} color={palette.yellow} />
            </Group>
            <Path
              path={paths.crest}
              color={palette.navy}
              style="stroke"
              strokeWidth={2}
              strokeJoin="round"
            />
          </Group>
          <Group transform={approvedTransform}>
            <Path path={paths.approved} color={palette.yellow} />
          </Group>
        </Group>
        <Path
          path={paths.hex}
          color={onNavy ? 'rgba(255,210,9,0.55)' : palette.navy}
          style="stroke"
          strokeWidth={3}
        />
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
