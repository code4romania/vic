import React from 'react';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

// Backdrop of the legacy sheets (SafeAreaBottomSheet). New sheets use components/ui/Sheet.
export const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} opacity={0.3} enableTouchThrough={true} />
);
