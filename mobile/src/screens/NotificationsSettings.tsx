import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Divider, Icon, StyleService, Text, useStyleSheet, useTheme } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import PressableContainer from '../components/PressableContainer';
import BottomSheet from '@gorhom/bottom-sheet';
import { NotificationsFrom } from '../common/enums/notifications-from.enum';
import { NotificationBy } from '../common/enums/notification-by.enum';
import { useUpdateSettingsMutation } from '../services/settings/settings.service';
import { ISettingsUpdatesPayload } from '../services/settings/settings.api';
import { INotificationsSettings } from '../common/interfaces/user-profile.interface';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { renderBackdrop } from '../components/BottomSheet';
import { useUserProfile } from '../store/profile/profile.selector';
import useStore from '../store/store';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useReducedMotion } from 'react-native-reanimated';

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
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.settingTite} category="p2">
          {title}
        </Text>
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          style={styles.settingDescription}
          category="c1"
        >
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
          <Icon name={'check'} style={styles.checkIcon} fill={theme['color-primary-800']} />
        )}
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          style={selected ? { color: theme['color-primary-800'] } : {}}
          category="p2"
        >
          {label}
        </Text>
      </View>
    </PressableContainer>
  );
};

const NotificationsSettings = ({ navigation }: any) => {
  const styles = useStyleSheet(themedStyles);
  const { t } = useTranslation('notifications');

  const { userProfile } = useUserProfile();
  const { updateSettings } = useStore();
  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => ['1%', 200], []);

  // notifications state
  const [showNotificationFromOptions, setShowNotificationsFromOptions] = useState<boolean>(true);
  const [notificationFrom, setNotificationFrom] = useState<NotificationsFrom>(
    NotificationsFrom.ALL_ORGANIZATIONS,
  );
  const [notificationBy, setNotificationBy] = useState<NotificationBy[]>([]);

  const reducedMotion = useReducedMotion();

  // mutation
  const { mutate: updateNotificationsSettings } = useUpdateSettingsMutation();

  // init values from database
  useEffect(() => {
    if (userProfile?.notificationsSettings) {
      setNotificationFrom(userProfile.notificationsSettings.notificationsFrom);

      const notifBy = [];
      if (userProfile.notificationsSettings.notificationsViaEmail) {
        notifBy.push(NotificationBy.EMAIL);
      }

      if (userProfile.notificationsSettings.notificationsViaPush) {
        notifBy.push(NotificationBy.PUSH);
      }

      setNotificationBy(notifBy);
    }
  }, [userProfile]);

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
    onUpdateSettings({
      notificationsFrom: value as NotificationsFrom,
    });
  };

  const onNotificationByOptionPress = (value: string) => {
    const newValues = notificationBy.filter((option) => option !== value);

    if (newValues.length === notificationBy.length) {
      newValues.push(value as NotificationBy);
    }

    setNotificationBy(newValues);

    bottomSheetRef.current?.close();

    // update settings
    onUpdateSettings({
      notificationsViaEmail: newValues.includes(NotificationBy.EMAIL),
      notificationsViaPush: newValues.includes(NotificationBy.PUSH),
    });
  };

  const onUpdateSettings = (updates: ISettingsUpdatesPayload) => {
    if (userProfile) {
      updateNotificationsSettings(
        {
          id: userProfile?.notificationsSettings.id,
          settings: updates,
        },
        {
          onSuccess: (data: INotificationsSettings) => {
            updateSettings(data);
          },
          onError: (error) => {
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.SETTINGS_ERRORS.getError(
                (error as any).response?.data.code_error,
              )}`,
            });
          },
        },
      );
    }
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
        animateOnMount={reducedMotion ? false : true}
      >
        <View style={styles.contentContainer}>
          {showNotificationFromOptions ? (
            <>
              <Text
                allowFontScaling={ALLOW_FONT_SCALLING}
                category="p2"
                style={styles.bottomSheetTitle}
              >
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
              <Text
                allowFontScaling={ALLOW_FONT_SCALLING}
                category="p2"
                style={styles.bottomSheetTitle}
              >
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
    color: '$color-primary-800',
  },
});
