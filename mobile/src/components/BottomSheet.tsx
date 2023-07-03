import React, { useMemo } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { Text } from '@ui-kitten/components';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { SvgXml } from 'react-native-svg';
import successIcon from '../assets/svg/success-icon';
import upsIcon from '../assets/svg/ups-icon';
import Button from './Button';
import useStore from '../store/store';

type BottomSheetIconType = 'success' | 'warning';
export interface BottomSheetProps {
  modalRef: React.RefObject<BottomSheetModalMethods>;
  iconType?: BottomSheetIconType;
  heading: string;
  paragraph: JSX.Element;
  primaryAction: {
    status?: 'success' | 'danger';
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress?: () => void;
  };
}

const BottomSheet = ({
  modalRef,
  iconType,
  heading,
  paragraph,
  primaryAction,
  secondaryAction,
}: BottomSheetProps) => {
  const { close } = useStore();
  // variables
  const snapPoints = useMemo(() => {
    if (iconType) {
      return ['30%', '55%'];
    }

    return ['25%', '45%'];
  }, [iconType]);

  // renders
  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} opacity={0.3} enableTouchThrough={true} />
  );

  const onPrimaryActionClick = () => {
    primaryAction.onPress();
    // dismiss
    modalRef.current?.dismiss();
  };

  const onSecondaryActionClick = () => {
    if (secondaryAction && secondaryAction.onPress) {
      secondaryAction.onPress();
    }

    // dismiss
    modalRef.current?.dismiss();
  };

  const onBottomSheetStateChange = (state: number) => {
    if (state < 0) {
      close();
    }
  };

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={modalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={onBottomSheetStateChange}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.container}>
          {iconType && (
            <View style={styles.svgContainer}>
              <SvgXml
                xml={iconType === 'success' ? successIcon : upsIcon}
                height={110}
                width={110}
              />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text category="h1">{heading}</Text>
            {paragraph}
          </View>
          <View style={styles.buttonsContainer}>
            <Button
              label={primaryAction.label}
              status={primaryAction.status || 'success'}
              onPress={onPrimaryActionClick}
            />
            {secondaryAction && (
              <Button
                label={secondaryAction?.label}
                appearance="ghost"
                onPress={onSecondaryActionClick}
              />
            )}
          </View>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 24,
    paddingVertical: 8,
    paddingHorizontal: 40,
  },
  svgContainer: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttonsContainer: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
});
