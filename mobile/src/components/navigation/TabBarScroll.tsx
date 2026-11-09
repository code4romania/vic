import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { SharedValue, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { tabBar } from '../../common/theme/tokens';

interface TabBarScrollState {
  /** 0 = full tab bar, 1 = collapsed (icons only). */
  collapsed: SharedValue<number>;
}

const TabBarScrollContext = createContext<TabBarScrollState | null>(null);

export const TabBarScrollProvider = ({ children }: { children: ReactNode }) => {
  const collapsed = useSharedValue(0);
  const value = useMemo(() => ({ collapsed }), [collapsed]);
  return <TabBarScrollContext.Provider value={value}>{children}</TabBarScrollContext.Provider>;
};

export const useTabBarCollapsed = () => useContext(TabBarScrollContext)?.collapsed;

/**
 * Collapse rule from the canvas (same as Bluvi's FloatingTabBar): near the top (<= 24pt) the bar is
 * always full. Below that, 10pt of scrolling down collapses it and 10pt of scrolling up expands it.
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
  if (nextAccumulated >= tabBar.directionThreshold) {
    return { collapsed: 1, accumulated: nextAccumulated };
  }
  if (nextAccumulated <= -tabBar.directionThreshold) {
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
