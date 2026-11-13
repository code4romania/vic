// „Îndrăzneț” large title (prototype `.lt` + `.topbar`).
//
// Two pieces, because a list header scrolls but the compact bar must not:
// - the large title (Bricolage 44/0.96, 12pt under the status bar, 16 below) lives in the
//   content and, with `scrollY`, shrinks to 88% and fades between 10 and 80pt of scroll (`useLargeTitleCollapse`);
// - the compact glass bar (`CompactTitleBar`, alias `LargeTitleCompactBar`) is pinned at the top,
//   outside the scroll view, and comes in after 48pt.
//
// Usage:
// - ScrollView screen:  <Animated.ScrollView onScroll={useTabBarScroll(scrollY)}>
//                         <LargeTitleHeader title="Ore" scrollY={scrollY} bar="none" /> …
//                       </Animated.ScrollView>
//                       <CompactTitleBar title="Ore" scrollY={scrollY} />
// - FlatList header:    same, with the LargeTitleHeader in ListHeaderComponent and the
//                       CompactTitleBar after the list.
// - Static header (the title does not scroll, e.g. above a list): <LargeTitleHeader title="…"
//   scrollY={scrollY} /> renders both (bar="inline", the default).
// - Compact bar only:   <LargeTitleHeader title="…" scrollY={scrollY} bar="only" />.
// `compact={false}` / `compactOnly` are the older names of bar="none" / bar="only".
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from '../../design/components/Text';
import { CompactTitleBar, useLargeTitleCollapse } from './ScreenChrome';

export { CompactTitleBar, useLargeTitleCollapse, COMPACT_BAR_AFTER } from './ScreenChrome';
/** The compact glass bar alone (same as CompactTitleBar). */
export const LargeTitleCompactBar = CompactTitleBar;

export interface LargeTitleHeaderProps {
  title: string;
  /** Scroll offset of the screen: drives the title collapse and the compact bar. */
  scrollY?: SharedValue<number>;
  right?: ReactNode;
  left?: ReactNode;
  /**
   * Where the compact glass bar goes: `inline` renders it here (only right when this header does
   * not scroll), `none` leaves it to a `CompactTitleBar` you render after the list, `only` renders
   * just the bar. Default `inline`.
   */
  bar?: 'inline' | 'none' | 'only';
  /** @deprecated use bar="none" */
  compact?: boolean;
  /** @deprecated use bar="only" */
  compactOnly?: boolean;
  /** add the safe-area top inset above the title (default true; false inside a padded list) */
  safeTop?: boolean;
  testID?: string;
}

export const LargeTitleHeader = ({
  title,
  scrollY,
  right,
  left,
  bar,
  compact = true,
  compactOnly,
  safeTop = true,
  testID,
}: LargeTitleHeaderProps) => {
  const insets = useSafeAreaInsets();
  const mode = bar ?? (compactOnly ? 'only' : compact ? 'inline' : 'none');
  const collapse = useLargeTitleCollapse(scrollY);

  return (
    <>
      {scrollY && mode !== 'none' && <CompactTitleBar title={title} scrollY={scrollY} />}
      {mode !== 'only' && (
        <View style={[styles.large, safeTop && { paddingTop: insets.top + 12 }]} testID={testID}>
          {left}
          <Animated.View style={[styles.titleWrap, collapse]}>
            <AppText variant="largeTitle" accessibilityRole="header" numberOfLines={2}>
              {title}
            </AppText>
          </Animated.View>
          {right}
        </View>
      )}
    </>
  );
};

export default LargeTitleHeader;

const styles = StyleSheet.create((theme) => ({
  large: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space.gutter,
    paddingTop: 8,
    paddingBottom: 16,
    gap: theme.space.m,
  },
  titleWrap: { flex: 1, minWidth: 0, transformOrigin: 'left bottom' },
}));
