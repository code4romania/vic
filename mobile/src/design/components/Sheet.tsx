// Sheet „Îndrăzneț”: @gorhom/bottom-sheet v5 modal on paper, top radius 34, a 42×5 grabber, a
// header with a Bricolage 30 title and a round white close button, a 50% navy scrim and the
// `sheet` spring (150 ms timing with Reduce Motion). Detents: form 92%, filters 50% + 92%.
// The main button goes in the sticky `footer`, which rides above the keyboard.
import React, { forwardRef, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleProp,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetSpringConfigs,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import Animated, {
  Extrapolation,
  interpolate,
  ReduceMotion,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, palette, radius } from '../tokens';
import { duration, spring } from '../motion';
import { haptics } from '../haptics';
import { CloseIcon, ICON_STROKE } from '../icons';
import { useHideTabBarWhile } from '../../components/navigation/tab-bar-overlay';
import { useBackToClose } from '../../hooks/useBackToClose';

/**
 * form: one 92% detent · filters: 50% and 92% · auto: sized to the content ·
 * full: fixed height under the status bar, children fill it (long lists)
 */
export type SheetVariant = 'form' | 'filters' | 'auto' | 'full';

const DETENTS: Record<'form' | 'filters', string[]> = {
  form: ['92%'],
  filters: ['50%', '92%'],
};

const GRABBER = 'rgba(1,52,79,0.25)';
const GUTTER = 18;

export interface SheetProps extends Omit<BottomSheetModalProps, 'children'> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  variant?: SheetVariant;
  /** sticky footer for the main button (form / filters / full); inline at the end for auto */
  footer?: ReactNode;
  /** the round close button in the header (default true) */
  showClose?: boolean;
  /** accessibility label of the close button */
  closeLabel?: string;
  /** form / filters: wrap the children in a BottomSheetScrollView (default true) */
  scroll?: boolean;
  /** auto: measure and scroll the header, body and footer as a single dynamic-sized scrollable. */
  scrollable?: boolean;
  /** style of the body around the children */
  bodyStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Open with `ref.current?.present()`, close with `ref.current?.dismiss()`. */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(
  (
    {
      title,
      subtitle,
      children,
      variant = 'auto',
      footer,
      showClose = true,
      closeLabel = 'Închide',
      scroll = true,
      scrollable = false,
      bodyStyle,
      testID,
      onChange,
      onDismiss,
      ...props
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const reduced = useReducedMotion();
    const [open, setOpen] = useState(false);
    const openRef = useRef(false);
    const [footerHeight, setFooterHeight] = useState(0);
    useHideTabBarWhile(open);

    const sheetRef = useRef<BottomSheetModal | null>(null);
    const setRefs = useCallback(
      (node: BottomSheetModal | null) => {
        sheetRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);
    useBackToClose(open, dismiss);

    const springConfigs = useBottomSheetSpringConfigs({
      ...spring.sheet,
      reduceMotion: ReduceMotion.Never,
    });
    const timingConfigs = useBottomSheetTimingConfigs({
      duration: duration.reduced,
      reduceMotion: ReduceMotion.Never,
    });
    const animationConfigs = reduced ? timingConfigs : springConfigs;

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          style={[backdropProps.style, styles.scrim]}
          opacity={1}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          accessibilityLabel={closeLabel}
        />
      ),
      [closeLabel],
    );

    const footerPadding = Math.max(insets.bottom, 10) + 10;
    const stickyFooter = !!footer && variant !== 'auto';
    const renderFooter = useCallback(
      (footerProps: BottomSheetFooterProps) => (
        <BottomSheetFooter {...footerProps}>
          <View
            style={[styles.footer, { paddingBottom: footerPadding }]}
            onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
          >
            {footer}
          </View>
        </BottomSheetFooter>
      ),
      [footer, footerPadding],
    );

    const sizing = useMemo(() => {
      switch (variant) {
        case 'form':
        case 'filters':
          return { enableDynamicSizing: false, snapPoints: DETENTS[variant] };
        case 'full':
          // a fixed height: '100%' ignores topInset and pushes the bottom off screen
          return { enableDynamicSizing: false, snapPoints: [height - insets.top - 8] };
        default:
          return { enableDynamicSizing: true, maxDynamicContentSize: height - insets.top - 28 };
      }
    }, [variant, height, insets.top]);

    const header =
      title || subtitle || showClose ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {!!title && (
              <Text
                accessibilityRole="header"
                maxFontSizeMultiplier={fontScaleCap.display}
                style={styles.title}
              >
                {title}
              </Text>
            )}
            {!!subtitle && (
              <Text maxFontSizeMultiplier={fontScaleCap.text} style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </View>
          {showClose && (
            <Pressable
              onPress={dismiss}
              style={({ pressed }) => [styles.close, pressed ? styles.closePressed : null]}
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              hitSlop={4}
              testID={testID ? `${testID}-close` : undefined}
            >
              <CloseIcon size={20} color={palette.navy} strokeWidth={ICON_STROKE + 0.4} />
            </Pressable>
          )}
        </View>
      ) : null;

    const bottomSpace = stickyFooter ? footerHeight + 12 : Math.max(insets.bottom, 14) + 10;

    let content: ReactNode;
    if (variant === 'auto') {
      const autoContent = (
        <>
          {header}
          <View style={[styles.autoBody, bodyStyle]}>{children}</View>
          {!!footer && <View style={styles.inlineFooter}>{footer}</View>}
        </>
      );
      content = scrollable ? (
        <BottomSheetScrollView
          testID={testID}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.auto, { paddingBottom: bottomSpace }]}
        >
          {autoContent}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView testID={testID} style={[styles.auto, { paddingBottom: bottomSpace }]}>
          {autoContent}
        </BottomSheetView>
      );
    } else if (variant === 'full' || !scroll) {
      content = (
        <View
          testID={testID}
          // Full-height lists own their bottom safe-area padding inside the scroll content.
          style={[
            styles.fill,
            { paddingBottom: stickyFooter ? bottomSpace : variant === 'full' ? 0 : insets.bottom },
          ]}
        >
          {header}
          <View style={[styles.fill, bodyStyle]}>{children}</View>
        </View>
      );
    } else {
      content = (
        <View testID={testID} style={styles.fill}>
          {header}
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.body, { paddingBottom: bottomSpace }, bodyStyle]}
          >
            {children}
          </BottomSheetScrollView>
        </View>
      );
    }

    return (
      <BottomSheetModal
        ref={setRefs}
        topInset={insets.top + 8}
        {...sizing}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        footerComponent={stickyFooter ? renderFooter : undefined}
        animationConfigs={animationConfigs}
        overrideReduceMotion={ReduceMotion.Never}
        backgroundStyle={styles.background}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.grabber}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        // KeyboardProvider keeps the Android window full height. Gorhom's adjustResize path
        // assumes the OS resized it and skips both the interactive lift and footer offset.
        android_keyboardInputMode="adjustPan"
        onChange={(index, position, type) => {
          const nowOpen = index >= 0;
          if (nowOpen && !openRef.current) {
            haptics.light();
            // VoiceOver / TalkBack: say which sheet just opened
            if (title) {
              AccessibilityInfo.announceForAccessibility(title);
            }
          }
          openRef.current = nowOpen;
          setOpen(nowOpen);
          onChange?.(index, position, type);
        }}
        onDismiss={() => {
          openRef.current = false;
          setOpen(false);
          onDismiss?.();
        }}
        {...props}
      >
        {content}
      </BottomSheetModal>
    );
  },
);

Sheet.displayName = 'Sheet';

export default Sheet;

// ---------------------------------------------------------------------------------------------
// The screen behind an open sheet scales to 0.94 and rounds its corners.

/**
 * Progress (0 closed … 1 open) of a sheet, from its `animatedPosition`. Pass `animatedPosition` to
 * the Sheet and `progress` to `SheetBackdropScale` around the screen content:
 *
 *   const { animatedPosition, progress } = useSheetBackdropProgress();
 *   <SheetBackdropScale progress={progress}>…screen…</SheetBackdropScale>
 *   <Sheet ref={ref} animatedPosition={animatedPosition} … />
 */
export const useSheetBackdropProgress = () => {
  const { height } = useWindowDimensions();
  const animatedPosition = useSharedValue(height);
  const progress = useDerivedValue(() =>
    interpolate(animatedPosition.value, [height, height * 0.5], [0, 1], Extrapolation.CLAMP),
  );
  return { animatedPosition, progress };
};

export interface SheetBackdropScaleProps {
  progress: SharedValue<number>;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Scales its children to 0.94, lowers them 10pt and rounds them to 34 as the sheet opens. */
export const SheetBackdropScale = ({ progress, children, style }: SheetBackdropScaleProps) => {
  const reduced = useReducedMotion();
  const scaleStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return reduced
      ? { borderRadius: radius.sheet * p }
      : {
          borderRadius: radius.sheet * p,
          transform: [{ translateY: 10 * p }, { scale: 1 - 0.06 * p }],
        };
  });
  return (
    <Animated.View style={[styles.backdropScale, style, scaleStyle]}>{children}</Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  background: {
    backgroundColor: theme.colors.paper,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
  },
  handle: { paddingTop: 10, paddingBottom: 6 },
  grabber: { width: 42, height: 5, borderRadius: 3, backgroundColor: GRABBER },
  scrim: { backgroundColor: theme.colors.scrim },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 10,
    paddingHorizontal: GUTTER,
  },
  headerText: { flex: 1, gap: 4 },
  title: {
    fontFamily: theme.fontFamily.display,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -1.05,
    color: theme.colors.ink,
  },
  subtitle: { ...theme.type.caption, color: theme.colors.ink2 },
  close: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: { transform: [{ scale: 0.94 }] },
  auto: { paddingTop: 0 },
  autoBody: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 14 },
  inlineFooter: { paddingHorizontal: GUTTER, paddingTop: 10 },
  body: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 14 },
  fill: { flex: 1 },
  footer: {
    paddingTop: 10,
    paddingHorizontal: GUTTER,
    backgroundColor: theme.colors.paper,
  },
  backdropScale: { flex: 1, overflow: 'hidden' },
}));
