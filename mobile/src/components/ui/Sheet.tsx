import React, { forwardRef, ReactNode } from 'react';
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { Sheet as DesignSheet } from '../../design/components/Sheet';

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
  /** Scroll the complete auto-sized content, including its header and bottom safe area. */
  scrollable?: boolean;
}

/**
 * Legacy API over the „Îndrăzneț” Sheet: paper, radius 34, 42×5 grabber, 50% navy scrim, the
 * `sheet` spring. Sized to its content (it never goes under the status bar: taller content scrolls
 * inside), or `fullHeight` for long lists. Open it with `ref.current?.present()`.
 */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(
  ({ fullHeight, closeLabel, ...props }, ref) => (
    <DesignSheet
      ref={ref}
      variant={fullHeight ? 'full' : 'auto'}
      showClose={!!fullHeight}
      closeLabel={closeLabel}
      {...props}
    />
  ),
);

Sheet.displayName = 'Sheet';

export default Sheet;
