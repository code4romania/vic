import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { VText } from './VText';
import { colors, motion } from '../../common/theme/tokens';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
  testID?: string;
}

const PADDING = 3;

/** iOS-style segmented control with a white indicator that slides between segments. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.key === value),
  );
  const segmentWidth = width > 0 ? (width - PADDING * 2) / options.length : 0;
  const translateX = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const target = index * segmentWidth;
    translateX.value = reducedMotion
      ? target
      : withTiming(target, {
          duration: motion.indicator.duration,
          easing: motion.indicator.easing,
        });
  }, [index, segmentWidth, reducedMotion, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={styles.container}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 && (
        <Animated.View style={[styles.indicator, { width: segmentWidth }, indicatorStyle]} />
      )}
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            testID={testID ? `${testID}-${option.key}` : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.key)}
            style={styles.segment}
          >
            <VText
              variant="label"
              color={selected ? colors.ink : colors.muted}
              style={styles.label}
              numberOfLines={1}
            >
              {option.label}
            </VText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default SegmentedControl;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.soft,
    borderRadius: 10,
    padding: PADDING,
    height: 38,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    bottom: PADDING,
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: 'roboto-medium' },
});
