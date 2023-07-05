import React, { useMemo, useRef, useState } from 'react';
import { Divider, Icon, StyleService, Text, useStyleSheet, useTheme } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import PressableContainer from '../components/PressableContainer';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { NotificationsFrom } from '../common/enums/notifications-from.enum';
import { NotificationBy } from '../common/enums/notification-by.enum';

interface NotificationSettingProps {
  title: string;
  description: string;
  onPress: () => void;
}

interface NotificationOptionProps {
  label: string;
  value: string;
  selected?: boolean;
  multi?: boolean;
  onPress: (value: string) => void;
}

const NotificationSetting = ({ title, description, onPress }: NotificationSettingProps) => {
  const styles = useStyleSheet(themedStyles);
  return (
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
};

const NotificationOption = ({
  label,
  value,
  selected,
  multi,
  onPress,
}: NotificationOptionProps) => {
  const styles = useStyleSheet(themedStyles);
  const theme = useTheme();

  return (
    <PressableContainer onPress={onPress.bind(null, value)}>
      <View style={styles.bottomSheetOption}>
        {multi && selected && (
          <Icon name={'check'} style={styles.checkIcon} fill={theme['color-success-500']} />
        )}
        <Text style={selected ? { color: theme['color-success-500'] } : {}} category="p2">
          {label}
        </Text>
      </View>
    </PressableContainer>
  );
};

// renders
const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} opacity={0.3} enableTouchThrough={true} />
);

const NotificationsSettings = ({ navigation }: any) => {
  console.log('NotificationsSettings');
  const styles = useStyleSheet(themedStyles);
  const { t } = useTranslation('notifications');

  const [showNotificationFromOptions, setShowNotificationsFromOptions] = useState<boolean>(true);
  const [notificationFrom, setNotificationFrom] = useState<NotificationsFrom>(
    NotificationsFrom.ALL_ORGANIZATIONS,
  );
  const [notificationBy, setNotificationBy] = useState<NotificationBy[]>([]);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['1%', '25%'], []);

  const onOrganizationNotificationFromPress = () => {
    setShowNotificationsFromOptions(true);
    bottomSheetRef.current?.expand();
  };

  const onOrganizationNotificationByPress = () => {
    setShowNotificationsFromOptions(false);
    bottomSheetRef.current?.expand();
  };

  const onNotificationFromOptionPress = (value: string) => {
    setNotificationFrom(value as NotificationsFrom);
    bottomSheetRef.current?.close();
  };

  const onNotificationByOptionPress = (value: string) => {
    const newValues = notificationBy.filter((option) => option !== value);

    if (newValues.length === notificationBy.length) {
      newValues.push(value as NotificationBy);
    }

    setNotificationBy(newValues);

    bottomSheetRef.current?.close();
  };

  const byNotificationDescription = notificationBy
    .map((option) => `${t(`by.options.${option.toLocaleLowerCase()}`)}`)
    .join(', ');

  return (
    <>
      <PageLayout title={t('header')} onBackButtonPress={navigation.goBack}>
        <NotificationSetting
          title={t('from.title')}
          description={
            notificationFrom === NotificationsFrom.ALL_ORGANIZATIONS
              ? t('from.options.all_organizations')
              : t('from.options.my_organizations')
          }
          onPress={onOrganizationNotificationFromPress}
        />
        <Divider />
        <NotificationSetting
          title={t('by.title')}
          description={notificationBy.length > 0 ? byNotificationDescription : `${t('disabled')}`}
          onPress={onOrganizationNotificationByPress}
        />
        <Divider />
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
      >
        <View style={styles.contentContainer}>
          {showNotificationFromOptions ? (
            <>
              <Text category="p2" style={styles.bottomSheetTitle}>
                {`${t('from.title')}`}
              </Text>
              <NotificationOption
                label={t('from.options.all_organizations')}
                value={NotificationsFrom.ALL_ORGANIZATIONS}
                selected={notificationFrom === NotificationsFrom.ALL_ORGANIZATIONS}
                onPress={onNotificationFromOptionPress}
              />
              <NotificationOption
                label={t('from.options.my_organizations')}
                value={NotificationsFrom.MY_ORGANIZATIONS}
                selected={notificationFrom === NotificationsFrom.MY_ORGANIZATIONS}
                onPress={onNotificationFromOptionPress}
              />
            </>
          ) : (
            <>
              <Text category="p2" style={styles.bottomSheetTitle}>
                {`${t('by.title')}`}
              </Text>
              <NotificationOption
                multi
                label={t('by.options.email')}
                value={NotificationBy.EMAIL}
                selected={notificationBy.includes(NotificationBy.EMAIL)}
                onPress={onNotificationByOptionPress}
              />
              <NotificationOption
                multi
                label={t('by.options.push')}
                value={NotificationBy.PUSH}
                selected={notificationBy.includes(NotificationBy.PUSH)}
                onPress={onNotificationByOptionPress}
              />
            </>
          )}
        </View>
      </BottomSheet>
    </>
  );
};

export default NotificationsSettings;

const themedStyles = StyleService.create({
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    width: '100%',
  },
  bottomSheetTitle: {
    color: '$cool-gray-400',
    paddingVertical: 14,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    minWidth: 200,
  },
  checkIcon: {
    height: 24,
    width: 24,
    color: '$color-success-500',
  },
});
