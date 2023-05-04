import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';

interface BottomSheetProps {
  children: ReactNode;
  onDismiss: () => void;
}
const Backdrop = () => <View style={styles.backdrop} />;

const BottomSheet = ({ children, onDismiss }: BottomSheetProps) => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = ['50%'];

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    handlePresentModalPress();
  }, [handlePresentModalPress]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onDismiss}
      backgroundStyle={styles.backgroundStyle}
      stackBehavior="push"
      backdropComponent={Backdrop}
      handleComponent={() => null}
    >
      <View style={styles.childrenWrapper}>{children}</View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'grey', height: '100%' },
  childrenWrapper: {
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 20,
  },
  backgroundStyle: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});

export default BottomSheet;
