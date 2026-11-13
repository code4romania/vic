// Segmented control „Îndrăzneț”: a navy track with a yellow thumb that slides and resizes to the
// selected segment (spring snappy). Segments size to their labels (flex 1 1 auto).
// With count badges the row may not fit (small phones, Dynamic Type): the control measures what
// each segment needs (its longest word + badge) and, only when the row is too narrow, first tightens
// the padding, then puts each badge under its label, so no word is ever cut.
import React, { ReactNode, useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, palette } from '../tokens';
import { springTo } from '../motion';
import { haptics } from '../haptics';

export interface SegmentedOption<T extends string> {
  key: T;
  label: string;
  /** small badge after the label (e.g. pending items) */
  count?: number;
  /** optional icon before the label; gets whether the segment is selected */
  icon?: (selected: boolean) => ReactNode;
  /** screen reader label, when the visible label is not enough */
  accessibilityLabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (key: T) => void;
  testID?: string;
  /** testID of the thumb; defaults to `${testID}-indicator` */
  thumbTestID?: string;
  accessibilityLabel?: string;
}

const TRACK_PADDING = 5;
const LABEL_OFF = 'rgba(255,255,255,0.75)';
const SEGMENT_PADDING = 8;
const SEGMENT_GAP = 6;
const COMPACT_PADDING = 5;
const COMPACT_GAP = 4;

type Layout = { x: number; width: number };
/** inline: label and badge side by side; compact: the same, tighter; stacked: badge under label */
export type SegmentFit = 'inline' | 'compact' | 'stacked';

/** How the segments fit the track, from the width each needs laid out inline (padding included). */
export const segmentFit = (
  needed: number[],
  withCount: boolean[],
  available: number,
): SegmentFit => {
  const total = needed.reduce((sum, width) => sum + width, 0);
  if (total <= available + 0.5) {
    return 'inline';
  }
  const saved = withCount.reduce(
    (sum, hasCount) =>
      sum + 2 * (SEGMENT_PADDING - COMPACT_PADDING) + (hasCount ? SEGMENT_GAP - COMPACT_GAP : 0),
    0,
  );
  return total - saved <= available + 0.5 ? 'compact' : 'stacked';
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
  thumbTestID,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const reduced = useReducedMotion();
  const [layouts, setLayouts] = useState<Partial<Record<T, Layout>>>({});
  const [trackWidth, setTrackWidth] = useState(0);
  const [needed, setNeeded] = useState<Partial<Record<T, number>>>({});
  const withCount = options.map((option) => typeof option.count === 'number');
  const measure = trackWidth > 0 && withCount.some(Boolean);
  const neededWidths = options.map((option) => needed[option.key]);
  const fit: SegmentFit =
    measure && neededWidths.every((width) => typeof width === 'number')
      ? segmentFit(neededWidths as number[], withCount, trackWidth - 2 * TRACK_PADDING)
      : 'inline';
  const onNeededFor = useCallback(
    (key: T) => (event: LayoutChangeEvent) => {
      const { width: segmentWidth } = event.nativeEvent.layout;
      setNeeded((previous) =>
        previous[key] === segmentWidth ? previous : { ...previous, [key]: segmentWidth },
      );
    },
    [],
  );
  const active = options.find((option) => option.key === value) ?? options[0];
  const activeLayout = active ? layouts[active.key] : undefined;
  const x = activeLayout?.x ?? 0;
  const width = activeLayout?.width ?? 0;

  const thumbStyle = useAnimatedStyle(
    () => ({
      width: springTo(width, 'snappy', reduced),
      transform: [{ translateX: springTo(x, 'snappy', reduced) }],
    }),
    [x, width, reduced],
  );

  const onLayoutFor = useCallback(
    (key: T) => (event: LayoutChangeEvent) => {
      const { x: segmentX, width: segmentWidth } = event.nativeEvent.layout;
      setLayouts((previous) => {
        const current = previous[key];
        if (current && current.x === segmentX && current.width === segmentWidth) {
          return previous;
        }
        return { ...previous, [key]: { x: segmentX, width: segmentWidth } };
      });
    },
    [],
  );

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={styles.track}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      {measure && (
        // invisible: what each segment needs inline, its longest word next to its badge
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.measurer}
        >
          {options.map((option) => (
            <View
              key={option.key}
              testID={testID ? `${testID}-measure-${option.key}` : undefined}
              style={styles.measureRow}
              onLayout={onNeededFor(option.key)}
            >
              {option.icon?.(false)}
              <View>
                {option.label.split(' ').map((word, index) => (
                  <Text key={index} maxFontSizeMultiplier={fontScaleCap.text} style={styles.label}>
                    {word}
                  </Text>
                ))}
              </View>
              {typeof option.count === 'number' && (
                <View style={styles.count}>
                  <Text maxFontSizeMultiplier={fontScaleCap.text} style={styles.countText}>
                    {option.count}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      {activeLayout && width > 0 && (
        <Animated.View
          pointerEvents="none"
          testID={thumbTestID ?? (testID ? `${testID}-indicator` : undefined)}
          style={[styles.thumb, thumbStyle]}
        />
      )}
      {options.map((option) => {
        const selected = option.key === active?.key;
        const hasCount = typeof option.count === 'number';
        return (
          <Pressable
            key={option.key}
            testID={testID ? `${testID}-${option.key}` : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={
              option.accessibilityLabel ??
              (hasCount ? `${option.label}, ${option.count}` : option.label)
            }
            onLayout={onLayoutFor(option.key)}
            // 42pt segment + the track padding: a 52pt hit target
            hitSlop={{ top: TRACK_PADDING, bottom: TRACK_PADDING }}
            onPress={() => {
              if (!selected) {
                haptics.selection();
              }
              onChange(option.key);
            }}
            // Dynamic Type: a label of several words wraps to a second line instead of being cut;
            // one-word labels keep their width, so they never break mid-word
            style={[
              styles.segment,
              option.label.includes(' ') ? null : styles.segmentOneWord,
              fit === 'compact' ? styles.segmentCompact : null,
              fit === 'stacked' ? styles.segmentStacked : null,
            ]}
          >
            {option.icon?.(selected)}
            <Text
              numberOfLines={2}
              maxFontSizeMultiplier={fontScaleCap.text}
              style={[styles.label, { color: selected ? palette.navy : LABEL_OFF }]}
            >
              {option.label}
            </Text>
            {hasCount && (
              <View style={[styles.count, selected ? styles.countOn : null]}>
                <Text
                  maxFontSizeMultiplier={fontScaleCap.text}
                  style={[styles.countText, { color: selected ? palette.yellow : LABEL_OFF }]}
                >
                  {option.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default SegmentedControl;

const styles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: 'row',
    backgroundColor: theme.colors.navy,
    borderRadius: 22,
    padding: TRACK_PADDING,
  },
  thumb: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: 0,
    borderRadius: 17,
    backgroundColor: theme.colors.yellow,
  },
  segment: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minHeight: 42,
    minWidth: 0,
    borderRadius: 17,
    paddingHorizontal: SEGMENT_PADDING,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SEGMENT_GAP,
  },
  segmentOneWord: { flexShrink: 0 },
  segmentCompact: { paddingHorizontal: COMPACT_PADDING, gap: COMPACT_GAP },
  segmentStacked: { flexDirection: 'column', gap: 2, paddingVertical: 4 },
  // far out of the track, unconstrained, so every word keeps its natural width
  measurer: { position: 'absolute', top: 0, left: -10000, width: 5000, opacity: 0 },
  measureRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SEGMENT_GAP,
    paddingHorizontal: SEGMENT_PADDING,
  },
  label: {
    flexShrink: 1,
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 13.5,
    lineHeight: 17,
    textAlign: 'center',
  },
  count: {
    minWidth: 20,
    // grows with Dynamic Type instead of clipping the number
    minHeight: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  countOn: { backgroundColor: theme.colors.navy },
  countText: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 11,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
}));
