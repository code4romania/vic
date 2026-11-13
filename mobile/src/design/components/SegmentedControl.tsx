// Segmented control „Îndrăzneț”: a fixed navy track with equal-width segments and a yellow thumb
// measured from their layout (spring snappy). Single-line labels shrink to fit beside count badges;
// iOS Large Content Viewer exposes the full label at larger accessibility sizes.
import React, { ReactNode, useCallback, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, Text, View } from 'react-native';
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
            accessibilityShowsLargeContentViewer={Platform.OS === 'ios'}
            accessibilityLargeContentTitle={Platform.OS === 'ios' ? option.label : undefined}
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
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              maxFontSizeMultiplier={fontScaleCap.segment}
              ellipsizeMode="clip"
              style={[styles.label, { color: selected ? palette.navy : LABEL_OFF }]}
            >
              {option.label}
            </Text>
            {hasCount && (
              <View style={[styles.count, selected ? styles.countOn : null]}>
                <Text
                  maxFontSizeMultiplier={fontScaleCap.segment}
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
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 42,
    minWidth: 0,
    borderRadius: 17,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    flexShrink: 1,
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 13.5,
    lineHeight: 17,
    textAlign: 'center',
  },
  count: {
    flexShrink: 0,
    minWidth: 20,
    minHeight: 20,
    paddingVertical: 3,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  countOn: { backgroundColor: theme.colors.navy },
  countText: { fontFamily: theme.fontFamily.textHeavy, fontSize: 11, lineHeight: 14 },
}));
