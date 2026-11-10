import React, { useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Svg, { Path } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import PageLayout from '../layouts/PageLayout';
import { NotificationsFrom } from '../common/enums/notifications-from.enum';
import { NotificationBy } from '../common/enums/notification-by.enum';
import { useUpdateSettingsMutation } from '../services/settings/settings.service';
import { ISettingsUpdatesPayload } from '../services/settings/settings.api';
import { INotificationsSettings } from '../common/interfaces/user-profile.interface';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useUserProfile } from '../store/profile/profile.selector';
import useStore from '../store/store';
import { registerForPushNotificationsAsync } from '../common/utils/notifications';
import { colors, spacing } from '../common/theme/tokens';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { Group, ListRow, PressableScale, Sheet, StateIcon, VButton, VText } from '../components/ui';

const Check = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="m5 12 5 5 9-10"
      stroke={colors.navy}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface NotificationOptionProps {
  label: string;
  value: string;
  selected?: boolean;
  /** several options can be on at once (email and push) */
  multi?: boolean;
  disabled?: boolean;
  last?: boolean;
  onPress: (value: string) => void;
}

/** One option in the sheet: the label and a navy check on the selected one (like FormSelect). */
const NotificationOption = ({
  label,
  value,
  selected,
  multi,
  disabled,
  last,
  onPress,
}: NotificationOptionProps) => (
  <PressableScale
    onPress={() => onPress(value)}
    disabled={disabled}
    pressedScale={0.99}
    style={[styles.option, !last && styles.optionDivider]}
    accessibilityRole={multi ? 'checkbox' : 'button'}
    accessibilityLabel={label}
    accessibilityState={multi ? { checked: !!selected, disabled } : { selected, disabled }}
    testID={`notifications-option-${value.toLowerCase()}`}
  >
    <VText variant={selected ? 'bodyStrong' : 'body'} style={styles.optionText}>
      {label}
    </VText>
    {selected && <Check />}
  </PressableScale>
);

const NotificationsSettings = ({ navigation }: any) => {
  const { t } = useTranslation('notifications');
  const paddingTop = usePaddingTop();

  const { userProfile } = useUserProfile();
  const { updateSettings } = useStore();

  const fromSheetRef = useRef<BottomSheetModal>(null);
  const bySheetRef = useRef<BottomSheetModal>(null);
  const notificationsBottomSheetRef = useRef<BottomSheetModal>(null);

  // notifications state
  const [notificationFrom, setNotificationFrom] = useState<NotificationsFrom>(
    NotificationsFrom.ALL_ORGANIZATIONS,
  );
  const [notificationBy, setNotificationBy] = useState<NotificationBy[]>([]);

  // mutation
  const { mutate: updateNotificationsSettings, isLoading: isUpdating } =
    useUpdateSettingsMutation();

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

  const onNotificationFromOptionPress = (value: string) => {
    setNotificationFrom(value as NotificationsFrom);
    fromSheetRef.current?.dismiss();
    onUpdateSettings({
      notificationsFrom: value as NotificationsFrom,
    });
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() => undefined);
    notificationsBottomSheetRef.current?.dismiss();
  };

  const onNotificationByOptionPress = async (value: string) => {
    const newValues = notificationBy.filter((option) => option !== value);

    if (newValues.length === notificationBy.length) {
      newValues.push(value as NotificationBy);
    }

    // we're checking if we're trying to enable push notifications
    if (newValues.includes(NotificationBy.PUSH)) {
      const { token } = await registerForPushNotificationsAsync();
      // if a token does not exist -> we did not grant access to notifications for the app -> show warning modal
      if (!token) {
        bySheetRef.current?.dismiss();
        notificationsBottomSheetRef?.current?.present();
        return;
      }
    }

    setNotificationBy(newValues);

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
      <PageLayout
        title={t('header')}
        onBackButtonPress={navigation.goBack}
        headerStyle={{ paddingTop, backgroundColor: colors.canvas }}
      >
        <View style={styles.canvas}>
          <Group>
            <ListRow
              title={`${t('from.title')}`}
              subtitle={
                notificationFrom === NotificationsFrom.ALL_ORGANIZATIONS
                  ? `${t('from.options.all_organizations')}`
                  : `${t('from.options.my_organizations')}`
              }
              onPress={() => fromSheetRef.current?.present()}
              testID="notifications-from"
            />
            <ListRow
              title={`${t('by.title')}`}
              subtitle={notificationBy.length > 0 ? byNotificationDescription : `${t('disabled')}`}
              onPress={() => bySheetRef.current?.present()}
              divider={false}
              testID="notifications-by"
            />
          </Group>
        </View>
      </PageLayout>
      <Sheet ref={fromSheetRef} title={`${t('from.title')}`} testID="notifications-from-sheet">
        <View>
          <NotificationOption
            label={t('from.options.all_organizations')}
            value={NotificationsFrom.ALL_ORGANIZATIONS}
            selected={notificationFrom === NotificationsFrom.ALL_ORGANIZATIONS}
            disabled={isUpdating}
            onPress={onNotificationFromOptionPress}
          />
          <NotificationOption
            label={t('from.options.my_organizations')}
            value={NotificationsFrom.MY_ORGANIZATIONS}
            selected={notificationFrom === NotificationsFrom.MY_ORGANIZATIONS}
            disabled={isUpdating}
            last
            onPress={onNotificationFromOptionPress}
          />
        </View>
      </Sheet>
      <Sheet ref={bySheetRef} title={`${t('by.title')}`} testID="notifications-by-sheet">
        <View>
          <NotificationOption
            multi
            label={t('by.options.email')}
            value={NotificationBy.EMAIL}
            selected={notificationBy.includes(NotificationBy.EMAIL)}
            disabled={isUpdating}
            onPress={onNotificationByOptionPress}
          />
          <NotificationOption
            multi
            label={t('by.options.push')}
            value={NotificationBy.PUSH}
            selected={notificationBy.includes(NotificationBy.PUSH)}
            disabled={isUpdating}
            last
            onPress={onNotificationByOptionPress}
          />
        </View>
      </Sheet>
      <Sheet
        ref={notificationsBottomSheetRef}
        title={`${t('warning_modal.title')}`}
        subtitle={`${t('warning_modal.description')}`}
        testID="notifications-off-sheet"
      >
        <StateIcon kind="notifications" size={56} />
        <VButton
          label={`${t('warning_modal.btn_label')}`}
          onPress={openAppSettings}
          testID="notifications-open-settings"
        />
        <VButton
          variant="soft"
          label={`${t('warning_modal.later')}`}
          onPress={() => notificationsBottomSheetRef.current?.dismiss()}
        />
      </Sheet>
    </>
  );
};

export default NotificationsSettings;

const styles = StyleSheet.create({
  // PageLayout pads its content by 16 on white: the gray canvas fills it edge to edge, with the
  // 20pt page margins
  canvas: {
    flex: 1,
    marginHorizontal: -spacing.l,
    marginVertical: -spacing.s,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.s,
    backgroundColor: colors.canvas,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  optionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  optionText: { flex: 1 },
});
