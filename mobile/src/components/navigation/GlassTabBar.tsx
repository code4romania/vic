import React, { ReactNode, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { elevation, fontFamily, fontScaleCap, glass, palette, tabBar } from '../../design/tokens';
import { duration, spring } from '../../design/motion';
import { haptics } from '../../design/haptics';
import {
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
  HomeIcon,
  LucideIcon,
  UserIcon,
} from '../../design/icons';
import { useTabBarAccessoryValue, useTabBarCollapsed } from './TabBarScroll';
import { useTabBarOverlayOpen } from './tab-bar-overlay';

export type TabIconName = 'home' | 'events' | 'hours' | 'documents' | 'profile';

const ICONS: Record<TabIconName, LucideIcon> = {
  home: HomeIcon,
  events: CalendarIcon,
  hours: ClockIcon,
  documents: DocumentIcon,
  profile: UserIcon,
};

export interface GlassTabBarItem {
  icon: TabIconName;
  label: string;
}

export interface GlassTabBarProps extends BottomTabBarProps {
  items: Record<string, GlassTabBarItem>;
}

/** Distance of the bar from the bottom edge of the screen. */
const useBarBottom = () => {
  const insets = useSafeAreaInsets();
  return insets.bottom > 0 ? tabBar.bottom : 16;
};

/** Height the floating bar takes over the content, for bottom padding on tab screens. */
export const useGlassTabBarInset = () => useBarBottom() + tabBar.height + 16;

// The minimised pill: a glass ring around the yellow lens with the active icon.
const PILL_RING = 4;
const PILL = tabBar.pill + PILL_RING * 2;
const ACCESSORY_HEIGHT = tabBar.pill;
const ACCESSORY_GAP = 10;
const EXPAND_HINT = 'Arată toate tab-urile';

/**
 * Real glass on iOS 26 (Liquid Glass); older iOS a blur with 58% white over it; Android a dense
 * white (expo-blur only blurs inside a BlurTargetView there, so a BlurView is just a tint).
 */
export const GlassSurface = ({ radius, children }: { radius: number; children?: ReactNode }) => {
  const liquid = Platform.OS === 'ios' && isLiquidGlassAvailable();
  const android = Platform.OS === 'android';
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius }]}
    >
      {liquid ? (
        <GlassView glassEffectStyle="regular" colorScheme="light" style={StyleSheet.absoluteFill} />
      ) : android ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.androidTint }]} />
      ) : (
        <>
          <BlurView intensity={glass.blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.tint }]} />
        </>
      )}
      <View style={[StyleSheet.absoluteFill, styles.stroke, { borderRadius: radius }]} />
      {children}
    </View>
  );
};

/**
 * „Îndrăzneț” glass tab bar: five equal slots, a yellow lens that slides under the active one and
 * labels that are always visible. Nothing grows: only the lens moves.
 *
 * Minimise (iOS 26 style): after 24pt of scrolling down the bar collapses into a small glass pill on
 * the left that holds only the active icon inside the lens, and the screen's action (see
 * useTabBarAccessory) slides beside it. 10pt of scrolling up, or a tap on the pill, expands it.
 * Width and position follow the sheet spring, the lens and icons the snappy one; labels fade out
 * first and come back last. With Reduce Motion it cross-fades.
 */
export const GlassTabBar = ({ state, navigation, items }: GlassTabBarProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const bottom = useBarBottom();
  const collapsed = useTabBarCollapsed();
  const accessory = useTabBarAccessoryValue();
  const reducedMotion = useReducedMotion();
  // a bottom sheet is open: the bar slides away so it never covers the sheet's buttons
  const hidden = useTabBarOverlayOpen();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accessoryWidth, setAccessoryWidth] = useState(0);

  const routes = state.routes.filter((route) => items[route.name]);
  const focusedKey = state.routes[state.index]?.key;
  const activeVisible = routes.some((route) => route.key === focusedKey);
  const activeIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === focusedKey),
  );

  const fullWidth = screenWidth - tabBar.side * 2;
  const slot = (fullWidth - tabBar.padding * 2) / Math.max(routes.length, 1);

  // A new tab always starts with the full bar.
  useEffect(() => {
    if (collapsed) {
      collapsed.value = 0;
    }
  }, [state.index, collapsed]);

  useAnimatedReaction(
    () => (collapsed ? collapsed.value : 0) === 1,
    (now, before) => {
      if (now !== before) {
        runOnJS(setIsCollapsed)(now);
      }
    },
  );

  const target = useDerivedValue(() => (collapsed ? collapsed.value : 0));
  // width / position: sheet spring. lens / icons: snappy. Reduce Motion: a short cross-fade.
  const pSheet = useDerivedValue(() =>
    reducedMotion
      ? withTiming(target.value, { duration: duration.reduced })
      : withSpring(target.value, spring.sheet),
  );
  const pSnap = useDerivedValue(() =>
    reducedMotion
      ? withTiming(target.value, { duration: duration.reduced })
      : withSpring(target.value, spring.snappy),
  );

  // the lens slides between slots with the snappy spring and squishes a little on the way
  const lensX = useSharedValue(activeIndex * slot);
  const squish = useSharedValue(1);
  useEffect(() => {
    lensX.value = reducedMotion
      ? withTiming(activeIndex * slot, { duration: duration.reduced })
      : withSpring(activeIndex * slot, spring.snappy);
    if (!reducedMotion) {
      squish.value = withSequence(
        withTiming(1.12, { duration: 120 }),
        withSpring(1, spring.snappy),
      );
    }
  }, [activeIndex, slot, reducedMotion, lensX, squish]);

  const barStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return {
        width: fullWidth,
        height: tabBar.height,
        borderRadius: tabBar.height / 2,
        opacity: 1 - pSheet.value,
      };
    }
    const p = pSheet.value;
    return {
      width: interpolate(p, [0, 1], [fullWidth, PILL]),
      height: interpolate(p, [0, 1], [tabBar.height, PILL]),
      borderRadius: interpolate(p, [0, 1], [tabBar.height / 2, PILL / 2]),
    };
  });

  const lensStyle = useAnimatedStyle(() => {
    const p = reducedMotion ? 0 : pSnap.value;
    const inset = interpolate(p, [0, 1], [tabBar.padding, PILL_RING]);
    return {
      top: inset,
      bottom: inset,
      left: interpolate(p, [0, 1], [tabBar.padding + lensX.value, PILL_RING]),
      width: interpolate(p, [0, 1], [slot, tabBar.pill]),
      transform: [{ scaleX: squish.value }, { scaleY: 1 - (squish.value - 1) * 0.67 }],
    };
  });

  // Reduce Motion: the pill cross-fades in instead of the bar shrinking
  const pillStyle = useAnimatedStyle(() => ({ opacity: pSheet.value }));

  const hideProgress = useDerivedValue(() =>
    reducedMotion
      ? withTiming(hidden ? 1 : 0, { duration: duration.reduced })
      : withSpring(hidden ? 1 : 0, spring.sheet),
  );
  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: 1 - hideProgress.value,
    transform: [{ translateY: hideProgress.value * (tabBar.height + bottom + 60) }],
  }));

  // the screen action: floats above the bar on the right, sits beside the pill when minimised
  const accessoryStyle = useAnimatedStyle(() => {
    const p = pSheet.value;
    const right = tabBar.side + fullWidth - accessoryWidth;
    const left = tabBar.side + PILL + ACCESSORY_GAP;
    return {
      opacity: accessoryWidth ? 1 : 0,
      transform: [
        { translateX: interpolate(p, [0, 1], [right, left]) },
        { translateY: interpolate(p, [0, 1], [-(tabBar.height + 10), 0]) },
      ],
    };
  });

  const expand = () => {
    if (collapsed) {
      collapsed.value = 0;
    }
  };

  const activeItem = items[routes[activeIndex]?.name];
  const ActiveIcon = ICONS[activeItem?.icon ?? 'home'];

  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'box-none'}
      style={[styles.wrapper, { bottom }, wrapperStyle]}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      testID="glass-tab-bar"
    >
      {accessory && (
        <Animated.View style={[styles.accessoryWrap, accessoryStyle]} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessory.accessibilityLabel ?? accessory.label}
            testID={accessory.testID ?? 'tab-bar-accessory'}
            onPress={accessory.onPress}
            onLayout={(event) => setAccessoryWidth(Math.ceil(event.nativeEvent.layout.width))}
            style={({ pressed }) => [
              styles.accessory,
              elevation.yellow,
              pressed && styles.accessoryPressed,
            ]}
          >
            {accessory.icon && <accessory.icon size={20} color={palette.navy} strokeWidth={2.6} />}
            <Text
              maxFontSizeMultiplier={fontScaleCap.display}
              numberOfLines={1}
              style={styles.accessoryLabel}
            >
              {accessory.label}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <Animated.View
        style={[styles.bar, elevation.float, barStyle]}
        pointerEvents={reducedMotion && isCollapsed ? 'none' : 'box-none'}
      >
        <GlassSurface radius={999} />
        {activeVisible && <Animated.View pointerEvents="none" style={[styles.lens, lensStyle]} />}
        <View accessibilityRole="tablist" style={styles.row}>
          {routes.map((route, index) => {
            const focused = route.key === focusedKey;
            return (
              <TabButton
                key={route.key}
                name={route.name}
                item={items[route.name]}
                focused={focused}
                index={index}
                activeIndex={activeIndex}
                slot={slot}
                progress={pSnap}
                reducedMotion={reducedMotion}
                hiddenWhenCollapsed={isCollapsed && !focused}
                collapsed={isCollapsed}
                onPress={() => {
                  if (isCollapsed) {
                    expand();
                    return;
                  }
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    haptics.selection();
                    navigation.navigate(route.name, route.params);
                  }
                }}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              />
            );
          })}
        </View>
      </Animated.View>

      {reducedMotion && (
        <Animated.View
          pointerEvents={isCollapsed ? 'auto' : 'none'}
          style={[styles.reducedPill, pillStyle]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={activeItem?.label}
            accessibilityHint={EXPAND_HINT}
            onPress={expand}
            style={StyleSheet.absoluteFill}
          >
            <GlassSurface radius={PILL / 2} />
            <View style={styles.reducedLens}>
              <ActiveIcon size={24} color={palette.navy} strokeWidth={2.3} />
            </View>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
};

interface TabButtonProps {
  name: string;
  item: GlassTabBarItem;
  focused: boolean;
  index: number;
  activeIndex: number;
  slot: number;
  progress: SharedValue<number>;
  reducedMotion: boolean;
  hiddenWhenCollapsed: boolean;
  /** the bar is minimised: this slot is the pill and a tap expands it */
  collapsed: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabButton = ({
  name,
  item,
  focused,
  index,
  activeIndex,
  slot,
  progress,
  reducedMotion,
  hiddenWhenCollapsed,
  collapsed,
  onPress,
  onLongPress,
}: TabButtonProps) => {
  const Icon = ICONS[item.icon];
  const color = focused ? palette.navy : palette.ink2;

  // Collapsing, every slot slides toward the pill: the active one lands inside the lens, the
  // others slide out of the clipped pill and fade. The slot never gets bigger than it was.
  const slotStyle = useAnimatedStyle(() => {
    const p = reducedMotion ? 0 : progress.value;
    return {
      left: interpolate(
        p,
        [0, 1],
        [tabBar.padding + index * slot, PILL_RING + (index - activeIndex) * tabBar.pill],
      ),
      width: interpolate(p, [0, 1], [slot, Math.min(slot, tabBar.pill)]),
      opacity: focused ? 1 : interpolate(p, [0, 0.5], [1, 0], Extrapolation.CLAMP),
    };
  });

  // labels go out first (first 35% of the collapse) and come back last
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35], [1, 0], Extrapolation.CLAMP),
    height: interpolate(progress.value, [0, 0.35], [13, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[styles.tabSlot, slotStyle]}
      pointerEvents={hiddenWhenCollapsed ? 'none' : 'auto'}
    >
      <Pressable
        testID={`tab-${name}`}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={item.label}
        accessibilityHint={collapsed && focused ? EXPAND_HINT : undefined}
        accessibilityElementsHidden={hiddenWhenCollapsed}
        importantForAccessibility={hiddenWhenCollapsed ? 'no-hide-descendants' : 'auto'}
        onPress={onPress}
        onLongPress={onLongPress}
        hitSlop={4}
        pressRetentionOffset={24}
        style={styles.tab}
      >
        <Icon size={24} color={color} strokeWidth={focused ? 2.3 : 2} />
        <Animated.Text
          maxFontSizeMultiplier={fontScaleCap.display}
          numberOfLines={1}
          style={[
            styles.label,
            { color, fontFamily: focused ? fontFamily.textHeavy : fontFamily.textBold },
            labelStyle,
          ]}
        >
          {item.label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

export default GlassTabBar;

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: tabBar.side, right: tabBar.side, height: tabBar.height },
  bar: { position: 'absolute', left: 0, bottom: 0 },
  clip: { overflow: 'hidden' },
  stroke: { borderWidth: 1, borderColor: glass.stroke },
  lens: {
    position: 'absolute',
    borderRadius: 28,
    backgroundColor: palette.yellow,
    shadowColor: palette.yellow,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  row: { ...StyleSheet.absoluteFill, overflow: 'hidden', borderRadius: 999 },
  tabSlot: { position: 'absolute', top: 0, bottom: 0 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 10.5, lineHeight: 13, letterSpacing: 0.1 },
  accessoryWrap: {
    position: 'absolute',
    left: -tabBar.side,
    bottom: (PILL - ACCESSORY_HEIGHT) / 2,
  },
  accessory: {
    height: ACCESSORY_HEIGHT,
    borderRadius: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.yellow,
  },
  accessoryPressed: { backgroundColor: palette.yellowPress, transform: [{ scale: 0.96 }] },
  accessoryLabel: { fontFamily: fontFamily.textHeavy, fontSize: 16, color: palette.navy },
  reducedPill: { position: 'absolute', left: 0, bottom: 0, width: PILL, height: PILL },
  reducedLens: {
    position: 'absolute',
    top: PILL_RING,
    left: PILL_RING,
    width: tabBar.pill,
    height: tabBar.pill,
    borderRadius: tabBar.pill / 2,
    backgroundColor: palette.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
