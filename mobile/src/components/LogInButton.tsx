import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '@ui-kitten/components';

import i18n from '../common/config/i18n';

interface LogInButtonProps {
  onPress: () => void;
}

const LogInButton = ({ onPress }: LogInButtonProps) => (
  <Pressable onPress={onPress}>
    <Text>
      {`${i18n.t('landing:registered')} `}
      <Text category="p2" status="success">{`${i18n.t('landing:login')}`}</Text>
    </Text>
  </Pressable>
);

export default LogInButton;
