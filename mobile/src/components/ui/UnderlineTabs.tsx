import React, { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, withTiming } from 'react-native-reanimated';
import { VText } from './VText';
import { colors, fonts, motion } from '../../common/theme/tokens';

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

/**
 * Airbnb-style category tabs with an icon, a label and a 2px underline as wide as the active tab,
 * which slides between tabs. No line under the whole row.
 */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  testID,
}: UnderlineTabsProps<T>) {
  const [layouts, setLayouts] = useState<Partial<Record<T, { x: number; width: number }>>>({});
  const activeTab = tabs.find((tab) => tab.key === value) ?? tabs[0];
  const activeLayout = activeTab ? layouts[activeTab.key] : undefined;
  const left = activeLayout?.x ?? 0;
  const width = activeLayout?.width ?? 0;
  const reducedMotion = useReducedMotion();

  const underlineStyle = useAnimatedStyle(() => {
    const timing = { duration: 380, easing: motion.indicator.easing };
    return {
      width: reducedMotion ? width : withTiming(width, timing),
      transform: [{ translateX: reducedMotion ? left : withTiming(left, timing) }],
    };
  }, [left, width, reducedMotion]);

  return (
    <View testID={testID} accessibilityRole="tablist" style={styles.container}>
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
            onLayout={(event) => {
              const { x, width: tabWidth } = event.nativeEvent.layout;
              setLayouts((previous) => ({ ...previous, [tab.key]: { x, width: tabWidth } }));
            }}
            style={styles.tab}
          >
            {tab.icon?.(active)}
            <VText
              variant="cap"
              color={active ? colors.navy : colors.muted}
              style={active ? styles.activeLabel : styles.label}
            >
              {tab.label}
            </VText>
          </Pressable>
        );
      })}
      {activeLayout && width > 0 && (
        <Animated.View
          testID={testID ? `${testID}-indicator` : undefined}
          style={[styles.underline, underlineStyle]}
        />
      )}
    </View>
  );
}

export default UnderlineTabs;

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', gap: 6, paddingTop: 8, paddingBottom: 12 },
  label: { fontFamily: fonts.medium },
  activeLabel: { fontFamily: fonts.bold },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.navy,
  },
});
