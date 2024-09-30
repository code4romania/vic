import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { renderBackdrop } from './BottomSheet';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { SvgXml } from 'react-native-svg';
import upsIcon from '../assets/svg/ups-icon';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import InlineLink from './InlineLink';

export const IdentityDataIncompleteModal = ({
  bottomSheetRef,
  navigation,
}: {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods>;
  navigation: any;
}) => {
  const { t } = useTranslation('home');

  const snapPoints = useMemo(() => [1, 500], []);
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleUpdateIdentityData = () => {
    bottomSheetRef.current?.close();
    navigation.navigate('identity-data');
  };

  const onClose = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      animateOnMount={reducedMotion ? false : true}
    >
      <BottomSheetView style={[styles.bottomSheetContainer, { paddingBottom: insets.bottom }]}>
        <SvgXml xml={upsIcon} height={100} width={100} />
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1" style={styles.text}>
          {`${t('incomplete_identity_data_modal.title')}`}
        </Text>
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          category="p1"
          style={styles.text}
          appearance="hint"
        >
          {`${t('incomplete_identity_data_modal.description')}`}
        </Text>
        <Button
          label={t('incomplete_identity_data_modal.action_btn_label')}
          onPress={handleUpdateIdentityData}
        />
        <InlineLink
          label={t('incomplete_identity_data_modal.cancel_btn_label')}
          style={{ color: theme['cool-gray-700'] }}
          onPress={onClose}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  bottomSheetContainer: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
});
