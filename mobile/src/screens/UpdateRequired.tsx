import React from 'react';
import { Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import SystemState from '../components/SystemState';

const STORE_URL =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_APP_STORE_URL
    : process.env.EXPO_PUBLIC_PLAY_STORE_URL;

// The API answered 426 AUTH_011: this build is below MOBILE_MIN_VERSION. Nothing else works until
// the user updates, so there is no way back from here.
const UpdateRequired = () => {
  const { t } = useTranslation('update_required');

  const onUpdate = () => {
    if (STORE_URL) {
      Linking.openURL(STORE_URL).catch(() => undefined);
    }
  };

  return (
    <SystemState
      kicker="VIC"
      title={t('heading')}
      description={t('paragraph')}
      actionLabel={t('update')}
      onAction={onUpdate}
      testID="update-required"
    />
  );
};

export default UpdateRequired;
