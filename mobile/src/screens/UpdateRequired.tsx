import React from 'react';
import { Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import MissingEntity from './MissingEntity';

// TODO: confirm the App Store listing before release (same links as the 1.0.x "Update now" banner).
const STORE_URL =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/ro/app/vic/id6474194051'
    : process.env.EXPO_PUBLIC_PLAY_STORE_URL ||
      'https://play.google.com/store/apps/details?id=org.commitglobal.vic';

// The API answered 426: this build is below the backend's MOBILE_MIN_VERSION. Nothing else works until
// the user updates from the store, so there is no way back from here.
const UpdateRequired = () => {
  const { t } = useTranslation('update_required');

  const onUpdate = () => {
    Linking.openURL(STORE_URL).catch(() => undefined);
  };

  return (
    <MissingEntity
      heading={t('heading')}
      paragraph={t('paragraph')}
      actionBtnLabel={t('update')}
      onActionBtnPress={onUpdate}
    />
  );
};

export default UpdateRequired;
