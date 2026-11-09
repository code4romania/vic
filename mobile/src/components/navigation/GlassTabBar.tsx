import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, motion, shadows, tabBar } from '../../common/theme/tokens';
import { ALLOW_FONT_SCALLING } from '../../common/constants/constants';
import { TabIcon, TabIconName } from './TabIcons';
import { useTabBarCollapsed } from './TabBarScroll';
import { useTabBarOverlayOpen } from './tab-bar-overlay';

export interface GlassTabBarItem {
  icon: TabIconName;
  label: string;
}

export interface GlassTabBarProps extends BottomTabBarProps {
  items: Record<string, GlassTabBarItem>;
}

/** Height the floating bar takes over the content, for bottom padding on tab screens. */
export const useGlassTabBarInset = () => {
  const insets = useSafeAreaInsets();
  return tabBar.height + tabBar.bottom + Math.max(insets.bottom - 12, 0) + 16;
};

/**
 * Floating glass tab bar (canvas "vic-nav"): white at 58% over a 22pt blur, radius 31, 22pt above the
 * home indicator. It shrinks to an icon-only pill while the user scrolls down a tab screen
 * (see useTabBarScroll) and grows back when they scroll up. Active tab: navy with a yellow dot.
 */
export const GlassTabBar = ({ state, navigation, items }: GlassTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const collapsed = useTabBarCollapsed();
  const reducedMotion = useReducedMotion();
  // a bottom sheet is open: the bar slides away so it never covers the sheet's buttons
  const hidden = useTabBarOverlayOpen();

  // Narrow phones (320pt) get a bar that fits with 16pt on each side.
  const fullWidth = Math.min(tabBar.width, screenWidth - 32);
  const collapsedWidth = Math.min(tabBar.collapsedWidth, fullWidth);

  // A new tab always starts with the full bar.
  useEffect(() => {
    if (collapsed) {
      collapsed.value = 0;
    }
  }, [state.index, collapsed]);

  const progress = useDerivedValue(() => {
    const target = collapsed ? collapsed.value : 0;
    if (reducedMotion) {
      return target;
    }
    const timing = target === 1 ? motion.tabBar.collapse : motion.tabBar.expand;
    return withTiming(target, { duration: timing.duration, easing: timing.easing });
  });

  const barStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const height = tabBar.height + (tabBar.collapsedHeight - tabBar.height) * p;
    return {
      width: fullWidth + (collapsedWidth - fullWidth) * p,
      height,
      borderRadius: height / 2,
    };
  });

  const hideProgress = useDerivedValue(() =>
    reducedMotion ? (hidden ? 1 : 0) : withTiming(hidden ? 1 : 0, motion.tabBar.collapse),
  );

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: 1 - hideProgress.value,
    transform: [{ translateY: hideProgress.value * (tabBar.height + tabBar.bottom + 40) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, progress.value * 1.6),
    maxHeight: 14 * (1 - progress.value),
  }));

  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'box-none'}
      style={[
        styles.wrapper,
        { bottom: tabBar.bottom + Math.max(insets.bottom - 12, 0) },
        wrapperStyle,
      ]}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      testID="glass-tab-bar"
    >
      <Animated.View style={[styles.bar, shadows.floating, barStyle]}>
        <View style={[StyleSheet.absoluteFill, styles.clip]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={[StyleSheet.absoluteFill, styles.tint]} />
        </View>
        <View accessibilityRole="tablist" style={styles.row}>
          {state.routes.map((route, index) => {
            const item = items[route.name];
            if (!item) {
              return null;
            }
            const focused = state.index === index;
            const color = focused ? colors.navy : colors.muted;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };
            return (
              <Pressable
                key={route.key}
                testID={`tab-${route.name}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={item.label}
                onPress={onPress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                hitSlop={6}
                pressRetentionOffset={24}
                style={styles.tab}
              >
                <TabIcon name={item.icon} color={color} active={focused} />
                <Animated.Text
                  allowFontScaling={ALLOW_FONT_SCALLING}
                  numberOfLines={1}
                  style={[
                    styles.label,
                    { color, fontFamily: focused ? fonts.bold : fonts.medium },
                    labelStyle,
                  ]}
                >
                  {item.label}
                </Animated.Text>
                {focused && <View testID={`tab-${route.name}-dot`} style={styles.dot} />}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default GlassTabBar;

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { overflow: 'visible' },
  clip: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  // iOS: 58% white over the blur. Android has no backdrop blur here, so the bar is nearly opaque.
  tint: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.94)',
  },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 10, lineHeight: 13 },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.yellow,
  },
});
