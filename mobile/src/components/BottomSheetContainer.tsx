import { View, Button, StyleSheet } from 'react-native';
import BottomSheet, { useBottomSheet } from '@gorhom/bottom-sheet';
import React, { useMemo, useState } from 'react';

const CustomBackdrop = () => {
  return <View style={styles.backdrop}>{/* Your custom backdrop content */}</View>;
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

const BottomSheetModalContent = ({ onClose }: any) => {
  const { close } = useBottomSheet();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Bottom sheet modal content */}
      <Button
        title="Close"
        onPress={() => {
          close();
          onClose();
        }}
      />
    </View>
  );
};

const BottomSheetContainer = () => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [isOpened, setIsOpened] = useState<boolean>(false);

  // variables
  const snapPoints = useMemo(() => ['1%', '50%'], []);

  const onOpen = () => {
    if (bottomSheetRef !== null) {
      bottomSheetRef?.current?.snapToPosition('50%');
      setIsOpened(true);
    }
  };

  return (
    <>
      <Button title="Open Bottom Sheet" onPress={onOpen} />

      <BottomSheet
        // eslint-disable-next-line react/no-unstable-nested-components
        backdropComponent={() => (isOpened ? <CustomBackdrop /> : <></>)}
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
      >
        <BottomSheetModalContent onClose={setIsOpened.bind(null, false)} />
      </BottomSheet>
    </>
  );
};

export default BottomSheetContainer;
