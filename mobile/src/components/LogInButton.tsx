import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface LogInButtonProps {
  onPress: () => void;
}

const LogInButton = ({ onPress }: LogInButtonProps) => {
  const { t } = useTranslation('landing');

  return (
    <Pressable onPress={onPress}>
      <Text allowFontScaling={ALLOW_FONT_SCALLING}>
        {`${t('registered')} `}
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2" status="primary">{`${t(
          'login',
        )}`}</Text>
      </Text>
    </Pressable>
  );
};

export default LogInButton;
