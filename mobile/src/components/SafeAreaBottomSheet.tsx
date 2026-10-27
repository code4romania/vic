import React, { forwardRef, useMemo } from 'react';
import BottomSheet, { BottomSheetProps } from '@gorhom/bottom-sheet';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  ({ snapPoints, children, ...props }, ref) => {
    const insets = useSafeAreaInsets();
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
      <BottomSheet ref={ref} snapPoints={safeSnapPoints} {...props}>
        <View style={[styles.content, { paddingBottom: bottomInset }]}>{children}</View>
      </BottomSheet>
    );
  },
);

export default SafeAreaBottomSheet;

const styles = StyleSheet.create({
  content: { flex: 1 },
});
