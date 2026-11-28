// Navy header of a detail screen (organization, event), „Îndrăzneț”: the back button, a leading tile
// (logo, date) and the title to its right, with a subtitle under the title. It is pinned and
// collapses as the content scrolls, like an iOS large title: the large title (up to 28, two lines)
// cross-fades into a 17pt one-line title with an ellipsis, the tile shrinks, the extra content under
// the row (chips) fades out, and the header's height follows so the content stays right under it.
// The name stays to the right of the back button in every state. Reduce Motion: no movement, the
// two states swap with a short fade.
import React, { ReactNode, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { fitTitleSize } from '../../common/utils/title-fit';
import { duration } from '../../design/motion';
import { fontScaleCap, palette } from '../../design/tokens';
import { BackButton } from './ScreenChrome';

/** Height of the collapsed row under the status bar. */
export const COLLAPSED_HEADER_HEIGHT = 60;
/** The large title is at most this size, then shrinks until its longest word fits (fitTitleSize). */
const LARGE_TITLE_MAX = 28;
/** Navy under the last line of the expanded header. */
const CONTENT_BOTTOM = 18;

/** Scroll position and handler shared by a screen's scroll view and its CollapsingHeader. */
export const useCollapsingHeader = () => {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  // the expanded header's height: the content starts right under it
  const [headerHeight, setHeaderHeight] = useState(0);
  return { scrollY, onScroll, headerHeight, setHeaderHeight };
};

export interface CollapsingHeaderProps {
  scrollY: SharedValue<number>;
  title: string;
  subtitle?: string;
  /** the tile left of the large title (logo 48, date block) */
  leading?: ReactNode;
  /** the tile left of the compact title (logo 32); none if omitted */
  compactLeading?: ReactNode;
  /** right of the large title, aligned to its top (the event's date card); fades out on scroll */
  trailing?: ReactNode;
  /** lines the large title may take (2 by default) */
  titleLines?: number;
  /** under the row while expanded (chips, a note); fades out on scroll */
  extra?: ReactNode;
  onBack: () => void;
  backTestID?: string;
  backLabel?: string;
  /** the expanded height, for the content's top padding */
  onExpandedHeight?: (height: number) => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const CollapsingHeader = ({
  scrollY,
  title,
  subtitle,
  leading,
  compactLeading,
  trailing,
  titleLines = 2,
  extra,
  onBack,
  backTestID,
  backLabel,
  onExpandedHeight,
  testID,
  style,
}: CollapsingHeaderProps) => {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [titleWidth, setTitleWidth] = useState(0);
  const expanded = useSharedValue(0);
  const collapsed = insets.top + COLLAPSED_HEADER_HEIGHT;
  const { fontScale } = useWindowDimensions();
  const titleSize = Math.min(
    LARGE_TITLE_MAX,
    fitTitleSize(title, titleWidth, Math.min(Math.max(fontScale, 1), fontScaleCap.display)),
  );

  // 0 at rest, 1 once the header has shrunk to its compact height
  const progress = useDerivedValue(() => {
    const range = Math.max(1, expanded.value - collapsed);
    const p = interpolate(scrollY.value, [0, range], [0, 1], Extrapolation.CLAMP);
    return reduced ? withTiming(p > 0.5 ? 1 : 0, { duration: duration.reduced }) : p;
  });

  const containerStyle = useAnimatedStyle(() =>
    expanded.value > 0
      ? {
          height: interpolate(
            scrollY.value,
            [0, expanded.value - collapsed],
            [expanded.value, collapsed],
            Extrapolation.CLAMP,
          ),
        }
      : { height: collapsed },
  );
  const largeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6], [1, 0], Extrapolation.CLAMP),
    transform: reduced ? [] : [{ translateY: -12 * progress.value }],
  }));
  const extraStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35], [1, 0], Extrapolation.CLAMP),
  }));
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
    transform: reduced ? [] : [{ translateY: 8 * (1 - progress.value) }],
  }));

  // the natural height of the content (its wrapper is never squeezed): the expanded height follows
  // it when the title wraps or the extra content changes
  const onContentLayout = (event: LayoutChangeEvent) => {
    const height = Math.round(insets.top + event.nativeEvent.layout.height + CONTENT_BOTTOM);
    if (height !== expanded.value) {
      expanded.value = height;
      onExpandedHeight?.(height);
    }
  };

  return (
    <Animated.View
      testID={testID}
      pointerEvents="box-none"
      style={[styles.header, containerStyle, style]}
    >
      <View style={[styles.content, { top: insets.top }]} onLayout={onContentLayout}>
        <View style={styles.row}>
          <BackButton
            tone="glass"
            onPress={onBack}
            testID={backTestID}
            accessibilityLabel={backLabel}
          />
          <View style={styles.titles}>
            {/* expanded: the tile, the large title (two lines at most) and the subtitle */}
            <Animated.View style={[styles.layer, trailing ? styles.layerTop : null, largeStyle]}>
              {leading}
              <View
                style={styles.titleColumn}
                onLayout={(event) => setTitleWidth(event.nativeEvent.layout.width)}
              >
                <Text
                  accessibilityRole="header"
                  numberOfLines={titleLines}
                  maxFontSizeMultiplier={fontScaleCap.display}
                  style={[
                    styles.largeTitle,
                    {
                      fontSize: titleSize,
                      lineHeight: Math.round(titleSize * 1.02),
                      letterSpacing: -titleSize * 0.03,
                    },
                  ]}
                >
                  {title}
                </Text>
                {!!subtitle && (
                  <Text maxFontSizeMultiplier={fontScaleCap.text} style={styles.subtitle}>
                    {subtitle}
                  </Text>
                )}
              </View>
              {trailing}
            </Animated.View>
            {/* collapsed: one line with an ellipsis, over the large one; hidden from screen readers */}
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.layer, styles.compactLayer, compactStyle]}
            >
              {compactLeading}
              <View style={styles.titleColumn}>
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={fontScaleCap.display}
                  style={styles.compactTitle}
                >
                  {title}
                </Text>
                {!!subtitle && (
                  <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={fontScaleCap.display}
                    style={styles.compactSubtitle}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
            </Animated.View>
          </View>
        </View>
        {!!extra && <Animated.View style={[styles.extra, extraStyle]}>{extra}</Animated.View>}
      </View>
    </Animated.View>
  );
};

export default CollapsingHeader;

const styles = StyleSheet.create((theme) => ({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.navy,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  // never squeezed by the animated height: its own height is the expanded content
  content: { position: 'absolute', left: 0, right: 0, paddingHorizontal: theme.space.gutter },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 8 },
  titles: { flex: 1, minWidth: 0, minHeight: 44 },
  layer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // with a trailing card the title and the card share the top line
  layerTop: { alignItems: 'flex-start' },
  // the compact layer sits on the back button's line, whatever the large title's height
  compactLayer: { position: 'absolute', top: 0, left: 0, right: 0, height: 44 },
  titleColumn: { flex: 1, minWidth: 0 },
  largeTitle: {
    fontFamily: theme.fontFamily.display,
    color: theme.colors.white,
    includeFontPadding: false,
  },
  subtitle: {
    ...theme.type.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  compactTitle: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 17,
    lineHeight: 22,
    color: palette.white,
  },
  compactSubtitle: {
    ...theme.type.caption,
    fontSize: 12,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  extra: { marginTop: 14 },
}));
