import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * Asks before leaving a form with unsaved changes (back button, swipe back, Android Back).
 * Returns `allowLeave`: call it right before navigating away after a successful save.
 */
export const useConfirmDiscard = (navigation: any, dirty: boolean) => {
  const { t } = useTranslation('general');
  const allowed = useRef(false);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event: any) => {
        if (!dirty || allowed.current) {
          return;
        }
        event.preventDefault();
        Alert.alert(`${t('discard.title')}`, `${t('discard.message')}`, [
          { text: `${t('discard.keep')}`, style: 'cancel' },
          {
            text: `${t('discard.leave')}`,
            style: 'destructive',
            onPress: () => navigation.dispatch(event.data.action),
          },
        ]);
      }),
    [navigation, dirty, t],
  );

  return () => {
    allowed.current = true;
  };
};

export default useConfirmDiscard;
