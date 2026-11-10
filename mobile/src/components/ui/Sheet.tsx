import React, { forwardRef, ReactNode, useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { colors, motion, radius, spacing } from '../../common/theme/tokens';
import { useHideTabBarWhile } from '../navigation/tab-bar-overlay';
import { useBackToClose } from '../../hooks/useBackToClose';

export interface SheetProps extends Omit<BottomSheetModalProps, 'children'> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  testID?: string;
}

/**
 * VIC 2.0 bottom sheet: sized to its content, radius 20, gray grabber, 40% scrim,
 * slides up in 360ms. Open it with `ref.current?.present()`.
 */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(
  ({ title, subtitle, children, testID, onChange, onDismiss, ...props }, ref) => {
    const insets = useSafeAreaInsets();
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
        enableDynamicSizing
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
});
