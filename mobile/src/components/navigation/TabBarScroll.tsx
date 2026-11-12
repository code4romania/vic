import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { LucideIcon } from 'lucide-react-native';
import { SharedValue, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { tabBar } from '../../design/tokens';

/** The screen's main action (e.g. „Adaugă ore”): floats above the bar, sits beside the pill when minimised. */
export interface TabBarAccessory {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

interface TabBarScrollState {
  /** 0 = full tab bar, 1 = minimised (a pill with the active icon). */
  collapsed: SharedValue<number>;
  accessory: TabBarAccessory | null;
  setAccessory: (accessory: TabBarAccessory | null) => void;
}

const TabBarScrollContext = createContext<TabBarScrollState | null>(null);

export const TabBarScrollProvider = ({ children }: { children: ReactNode }) => {
  const collapsed = useSharedValue(0);
  const [accessory, setAccessory] = useState<TabBarAccessory | null>(null);
  const value = useMemo(() => ({ collapsed, accessory, setAccessory }), [collapsed, accessory]);
  return <TabBarScrollContext.Provider value={value}>{children}</TabBarScrollContext.Provider>;
};

export const useTabBarCollapsed = () => useContext(TabBarScrollContext)?.collapsed;

export const useTabBarAccessoryValue = () => useContext(TabBarScrollContext)?.accessory ?? null;

/**
 * Shows the screen's main action next to the tab bar while the screen is focused. Pass `null`
 * (e.g. when the action is not allowed) to hide it. Keep `accessory` stable (useMemo).
 */
export const useTabBarAccessory = (accessory: TabBarAccessory | null) => {
  const setAccessory = useContext(TabBarScrollContext)?.setAccessory;
  useFocusEffect(
    useCallback(() => {
      setAccessory?.(accessory);
      return () => setAccessory?.(null);
    }, [accessory, setAccessory]),
  );
};

/**
 * Minimise rule (iOS 26 tab bars): near the top (<= 24pt) the bar is always full. Further down,
 * 24pt of scrolling down minimises it and 10pt of scrolling up expands it again; direction changes
 * restart the count, so small jitter does nothing.
 * Returns the next collapsed value and the new accumulated distance.
 */
export const nextCollapse = (
  y: number,
  previousY: number,
  accumulated: number,
  collapsed: number,
): { collapsed: number; accumulated: number } => {
  'worklet';
  const delta = y - previousY;
  if (delta === 0) {
    return { collapsed, accumulated };
  }
  if (y <= tabBar.collapseAfter) {
    return { collapsed: 0, accumulated: 0 };
  }
  const nextAccumulated = accumulated > 0 !== delta > 0 ? delta : accumulated + delta;
  if (nextAccumulated >= tabBar.collapseAfter) {
    return { collapsed: 1, accumulated: nextAccumulated };
  }
  if (nextAccumulated <= -tabBar.expandAfter) {
    return { collapsed: 0, accumulated: nextAccumulated };
  }
  return { collapsed, accumulated: nextAccumulated };
};

/**
 * Scroll handler for tab screens: pass it to an `Animated.ScrollView` / `Animated.FlatList`
 * (`onScroll={handler} scrollEventThrottle={16}`). Optionally mirrors the offset into `scrollY`
 * for headers that react to scroll.
 */
export const useTabBarScroll = (scrollY?: SharedValue<number>) => {
  const fallback = useSharedValue(0);
  const collapsed = useTabBarCollapsed() ?? fallback;
  const lastY = useSharedValue(0);
  const accumulated = useSharedValue(0);

  return useAnimatedScrollHandler({
    onBeginDrag: (event) => {
      lastY.value = event.contentOffset.y;
    },
    onScroll: (event) => {
      const y = event.contentOffset.y;
      if (scrollY) {
        scrollY.value = y;
      }
      const next = nextCollapse(y, lastY.value, accumulated.value, collapsed.value);
      lastY.value = y;
      accumulated.value = next.accumulated;
      if (next.collapsed !== collapsed.value) {
        collapsed.value = next.collapsed;
      }
    },
  });
};
