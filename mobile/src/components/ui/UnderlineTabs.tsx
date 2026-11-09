import React, { ReactNode, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { VText } from './VText';
import { colors, motion } from '../../common/theme/tokens';

export interface UnderlineTab<T extends string> {
  key: T;
  label: string;
  icon?: (active: boolean) => ReactNode;
}

export interface UnderlineTabsProps<T extends string> {
  tabs: UnderlineTab<T>[];
  value: T;
  onChange: (key: T) => void;
  testID?: string;
}

const UNDERLINE_WIDTH = 72;

/** Airbnb-style category tabs with an icon, a label and a 2px underline that slides. */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  testID,
}: UnderlineTabsProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === value),
  );
  const tabWidth = width / Math.max(1, tabs.length);
  const left = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const target = index * tabWidth + (tabWidth - UNDERLINE_WIDTH) / 2;
    left.value = reducedMotion
      ? target
      : withTiming(target, { duration: 380, easing: motion.indicator.easing });
  }, [index, tabWidth, reducedMotion, left]);

  const underlineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: left.value }] }));

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={styles.container}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            testID={testID ? `${testID}-${tab.key}` : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            {tab.icon?.(active)}
            <VText variant="cap" color={active ? colors.navy : colors.muted} style={styles.label}>
              {tab.label}
            </VText>
          </Pressable>
        );
      })}
      {width > 0 && <Animated.View style={[styles.underline, underlineStyle]} />}
    </View>
  );
}

export default UnderlineTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  tab: { flex: 1, alignItems: 'center', gap: 6, paddingTop: 8, paddingBottom: 12 },
  label: { fontFamily: 'roboto-medium' },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: UNDERLINE_WIDTH,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.navy,
  },
});
