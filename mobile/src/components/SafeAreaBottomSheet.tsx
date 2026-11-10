import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetProps } from '@gorhom/bottom-sheet';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideTabBarWhile } from './navigation/tab-bar-overlay';
import { useBackToClose } from '../hooks/useBackToClose';

// the closed snap point used across the app (1px / 1%) is left untouched
const isOpenSnapPoint = (snapPoint: number | string) =>
  typeof snapPoint === 'number' && snapPoint > 1;

/**
 * BottomSheet that keeps its content above the android navigation bar.
 *
 * With edge-to-edge the sheet is drawn behind the navigation bar, so the open snap points are raised
 * by the bottom inset and the content is padded by the same amount.
 */
const SafeAreaBottomSheet = forwardRef<BottomSheet, BottomSheetProps>(
  ({ snapPoints, children, onChange, ...props }, ref) => {
    const insets = useSafeAreaInsets();
    // index 0 is the 1px "closed" snap point used across the app; anything above is open
    const [open, setOpen] = useState(false);
    useHideTabBarWhile(open);
    const sheetRef = useRef<BottomSheet | null>(null);
    const setRefs = useCallback(
      (node: BottomSheet | null) => {
        sheetRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    const close = useCallback(() => sheetRef.current?.close(), []);
    useBackToClose(open, close);
    const handleChange = useCallback<NonNullable<BottomSheetProps['onChange']>>(
      (index, position, type) => {
        setOpen(index > 0);
        onChange?.(index, position, type);
      },
      [onChange],
    );
    const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;

    const safeSnapPoints = useMemo(
      () =>
        Array.isArray(snapPoints)
          ? snapPoints.map((snapPoint) =>
              isOpenSnapPoint(snapPoint) ? (snapPoint as number) + bottomInset : snapPoint,
            )
          : snapPoints,
      [snapPoints, bottomInset],
    );

    return (
      <BottomSheet ref={setRefs} snapPoints={safeSnapPoints} onChange={handleChange} {...props}>
        <View style={[styles.content, { paddingBottom: bottomInset }]}>{children}</View>
      </BottomSheet>
    );
  },
);

export default SafeAreaBottomSheet;

const styles = StyleSheet.create({
  content: { flex: 1 },
});
