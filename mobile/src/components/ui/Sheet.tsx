import React, { forwardRef, ReactNode, useCallback, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { VText } from './VText';
import { PressableScale } from './PressableScale';
import { EventIcon } from '../events/EventIcons';
import { colors, motion, radius, spacing } from '../../common/theme/tokens';
import { useHideTabBarWhile } from '../navigation/tab-bar-overlay';
import { useBackToClose } from '../../hooks/useBackToClose';

export interface SheetProps extends Omit<BottomSheetModalProps, 'children'> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  testID?: string;
  /**
   * Tall sheet for long lists (counties, cities): fixed height under the status bar, a close button
   * in the header, and the children fill the rest (use a BottomSheetFlatList / ScrollView inside).
   */
  fullHeight?: boolean;
  /** accessibility label of the close button shown by `fullHeight` sheets */
  closeLabel?: string;
}

/**
 * VIC 2.0 bottom sheet: sized to its content, radius 20, gray grabber, 40% scrim,
 * slides up in 360ms. Open it with `ref.current?.present()`. It never goes under the status bar:
 * content taller than the screen scrolls inside the sheet instead.
 */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(
  (
    { title, subtitle, children, testID, onChange, onDismiss, fullHeight, closeLabel, ...props },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const [open, setOpen] = useState(false);
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
    const reducedMotion = useReducedMotion();
    const animationConfigs = useBottomSheetTimingConfigs({
      duration: reducedMotion ? 1 : motion.sheet.duration,
      easing: motion.sheet.easing,
    });

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          opacity={0.4}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={setRefs}
        topInset={insets.top + spacing.s}
        {...(fullHeight
          ? {
              enableDynamicSizing: false,
              // a fixed height: '100%' ignores topInset and pushes the bottom off screen
              snapPoints: [height - insets.top - spacing.s],
            }
          : {
              enableDynamicSizing: true,
              maxDynamicContentSize: height - insets.top - spacing.xl,
            })}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        animationConfigs={animationConfigs}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.grab}
        keyboardBlurBehavior="restore"
        onChange={(index, position, type) => {
          setOpen(index >= 0);
          onChange?.(index, position, type);
        }}
        onDismiss={() => {
          setOpen(false);
          onDismiss?.();
        }}
        {...props}
      >
        {fullHeight ? (
          <View testID={testID} style={[styles.full, { paddingBottom: insets.bottom }]}>
            <View style={styles.fullHeader}>
              <View style={styles.flex}>
                {!!title && (
                  <VText variant="h2" accessibilityRole="header">
                    {title}
                  </VText>
                )}
                {!!subtitle && <VText variant="sub">{subtitle}</VText>}
              </View>
              <PressableScale
                onPress={dismiss}
                style={styles.close}
                accessibilityRole="button"
                accessibilityLabel={closeLabel}
                hitSlop={8}
                testID={testID ? `${testID}-close` : undefined}
              >
                <EventIcon name="close" size={20} />
              </PressableScale>
            </View>
            {children}
          </View>
        ) : (
          <BottomSheetView
            testID={testID}
            style={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, spacing.l) + spacing.s },
            ]}
          >
            {(title || subtitle) && (
              <View style={styles.header}>
                {!!title && <VText variant="h2">{title}</VText>}
                {!!subtitle && <VText variant="sub">{subtitle}</VText>}
              </View>
            )}
            {children}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);

export default Sheet;

const styles = StyleSheet.create({
  background: { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet },
  grab: { width: 36, height: 5, borderRadius: 3, backgroundColor: colors.grab },
  content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.s, gap: spacing.l },
  header: { gap: 6 },
  full: { flex: 1, paddingTop: spacing.s, gap: spacing.m },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingHorizontal: spacing.gutter,
  },
  flex: { flex: 1, gap: 4 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
