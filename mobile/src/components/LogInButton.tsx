import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

interface LogInButtonProps {
  onPress: () => void;
}

const LogInButton = ({ onPress }: LogInButtonProps) => {
  const { t } = useTranslation('landing');

  return (
    <Pressable onPress={onPress}>
      <Text>
        {`${t('registered')} `}
        <Text category="p2" status="success">{`${t('login')}`}</Text>
      </Text>
    </Pressable>
  );
};

export default LogInButton;
