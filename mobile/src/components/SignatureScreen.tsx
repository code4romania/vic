import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import InlineLink from './InlineLink';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import Signature, { SignatureViewRef } from 'react-native-signature-canvas';

interface SignatureScreenProps {
  title: string;
  description: string;
  signatureRef: React.RefObject<SignatureViewRef>;
  onOK: (signaure: string) => void;
  onEnd: () => void;
  handleClear: () => void;
  handleEmpty: () => void;
  terms: string;
  actionButtonLabel: string;
  onAction: () => void;
  onClose: () => void;
  isError: boolean;
}
export const SignatureScreen = ({
  title,
  description,
  signatureRef,
  onOK,
  onEnd,
  handleEmpty,
  handleClear,
  terms,
  actionButtonLabel,
  onAction,
  onClose,
  isError,
}: SignatureScreenProps) => {
  const theme = useTheme();
  const { t } = useTranslation('documents-contract');

  return (
    <>
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1" style={styles.text}>
        {title}
      </Text>
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1" style={styles.text}>
        {description}
      </Text>
      <View
        style={[
          styles.signatureContainer,
          { borderColor: isError ? 'red' : theme['cool-gray-300'] },
        ]}
      >
        <Signature
          ref={signatureRef}
          webStyle={webStyle}
          style={styles.signatureWrapper}
          onOK={onOK}
          onEmpty={handleEmpty}
          onEnd={onEnd}
        />
      </View>
      {isError && <Text style={styles.errorText}>{`${t('volunteer_signature.required')}`}</Text>}
      <InlineLink
        label="Resetează"
        style={{ color: theme['cool-gray-700'] }}
        onPress={handleClear}
      />
      <Text
        allowFontScaling={ALLOW_FONT_SCALLING}
        category="p1"
        style={[styles.text, { color: theme['cool-gray-500'] }]}
      >
        {terms}
      </Text>

      <Button status="primary" label={actionButtonLabel} onPress={onAction} />

      <InlineLink
        label={t('general:back')}
        style={{ color: theme['cool-gray-700'] }}
        onPress={onClose}
      />
    </>
  );
};

const webStyle = `
  .m-signature-pad--footer {display: none; margin: 0px;}
  .m-signature-pad {width: 100%; height: 100%;}
  .m-signature-pad--body {width: 100%; height: 100%; border-radius: 8px;}
  canvas {width: 100% !important; height: 100% !important;}
`;

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  signatureContainer: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  signatureWrapper: {
    width: '100%',
    height: '100%',
  },
});
