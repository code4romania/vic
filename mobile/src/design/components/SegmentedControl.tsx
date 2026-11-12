// Segmented control „Îndrăzneț”: a navy track with a yellow thumb that slides and resizes to the
// selected segment (spring snappy). Segments size to their labels (flex 1 1 auto).
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

type Layout = { x: number; width: number };

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
    >
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
            style={styles.segment}
          >
            {option.icon?.(selected)}
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={fontScaleCap.text}
              style={[styles.label, { color: selected ? palette.navy : LABEL_OFF }]}
            >
              {option.label}
            </Text>
            {hasCount && (
              <View style={[styles.count, selected ? styles.countOn : null]}>
                <Text
                  maxFontSizeMultiplier={fontScaleCap.text}
                  style={[styles.countText, { color: selected ? palette.yellow : palette.white }]}
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
    borderRadius: 17,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 13.5,
    lineHeight: 18,
  },
  count: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  countOn: { backgroundColor: theme.colors.navy },
  countText: { fontFamily: theme.fontFamily.textHeavy, fontSize: 11, lineHeight: 14 },
}));
