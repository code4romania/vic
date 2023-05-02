import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { TouchableWithoutFeedback, View } from 'react-native';

interface BottomSheetProps {
  children: ReactNode;
  onDismiss: () => void;
}

const BottomSheet = ({ children, onDismiss }: BottomSheetProps) => {
  const styles = useStyleSheet(themedStyles);
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = ['100%'];

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    handlePresentModalPress();
  }, [handlePresentModalPress]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.modal}
        onDismiss={onDismiss}
        stackBehavior="push"
        handleComponent={() => null}
      >
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.greyBackground} />
        </TouchableWithoutFeedback>
        <View style={styles.childrenWrapper}>{children}</View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const themedStyles = StyleService.create({
  modal: { backgroundColor: 'color-basic-transparent-600' },
  greyBackground: {
    flex: 1,
  },
  childrenWrapper: {
    backgroundColor: '#fff',
    flex: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 20,
    zIndex: 10,
  },
});

export default BottomSheet;
