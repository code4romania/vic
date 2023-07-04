import React, { useCallback, useMemo, useRef } from 'react';
import { Divider, Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import PressableContainer from '../components/PressableContainer';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Button from '../components/Button';

interface NotificationSettingProps {
  title: string;
  description: string;
  onPress: () => void;
}

const NotificationSetting = ({ title, description, onPress }: NotificationSettingProps) => (
  <PressableContainer onPress={onPress}>
    <View style={styles.settingContainer}>
      <Text style={styles.settingTite} category="p2">
        {title}
      </Text>
      <Text style={styles.settingDescription} category="c1">
        {description}
      </Text>
    </View>
  </PressableContainer>
);

// renders
const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} opacity={0.3} enableTouchThrough={true} />
);

const NotificationsSettings = ({ navigation }: any) => {
  console.log('NotificationsSettings');
  const { t } = useTranslation('notifications');

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['1%', '30%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const onOrganizationNotificationFromPress = () => {
    console.log('open bottom sheet');
    bottomSheetRef.current?.expand();
  };

  const onOrganizationNotificationByPress = () => {
    console.log('open bottom sheet');
    bottomSheetRef.current?.expand();
  };

  const onClose = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <PageLayout title={t('header')} onBackButtonPress={navigation.goBack}>
        <NotificationSetting
          title={t('from.title')}
          description="Toate organizatiile"
          onPress={onOrganizationNotificationFromPress}
        />
        <Divider />
        <NotificationSetting
          title={t('by.title')}
          description="Email, Push"
          onPress={onOrganizationNotificationByPress}
        />
        <Divider />
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
          <Button label="Press me" onPress={onClose} />
        </View>
      </BottomSheet>
    </>
  );
};

export default NotificationsSettings;

const styles = StyleSheet.create({
  settingContainer: {
    paddingVertical: 16,
  },
  settingTite: {
    lineHeight: 24,
  },
  settingDescription: {
    lineHeight: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
