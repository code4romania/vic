import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { Text } from '@ui-kitten/components';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useAuth } from '../hooks/useAuth';
import FormLayout from '../layouts/FormLayout';
import InlineLink from '../components/InlineLink';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { usePaddingTop } from '../hooks/usePaddingTop';

// After sign-up, or a login before confirming: the account is confirmed by the link in the email,
// which opens in the browser and comes back to Login with the email filled in.
const ValidateAccount = ({ navigation }: any) => {
  const { t } = useTranslation('register');
  const paddingTop = usePaddingTop();
  const { userName, resendConfirmationCode } = useAuth();
  const [isResending, setIsResending] = useState<boolean>(false);

  const onResend = async () => {
    if (!userName || isResending) {
      return;
    }
    setIsResending(true);
    try {
      await resendConfirmationCode(userName);
      Toast.show({ type: 'success', text1: `${t('validate_account.resent')}` });
    } finally {
      setIsResending(false);
    }
  };

  const onGoToLogin = () => {
    navigation.navigate('login', { email: userName }, { pop: true });
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('validate_account.go_to_login'),
        onPrimaryActionButtonClick: onGoToLogin,
      }}
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3">{`${t(
          'validate_account.heading',
        )}`}</Text>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1" style={styles.paragraph}>
          {`${t('validate_account.check_email', { email: userName })}`}
        </Text>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1" style={styles.paragraph}>
          {`${t('validate_account.not_received')}`}
        </Text>
        {!!userName && (
          <InlineLink
            label={isResending ? t('validate_account.resending') : t('validate_account.resend')}
            onPress={onResend}
          />
        )}
      </FormLayout>
    </PageLayout>
  );
};

export default ValidateAccount;

const styles = StyleSheet.create({
  paragraph: { lineHeight: 22 },
});
