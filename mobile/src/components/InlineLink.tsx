import React from 'react';
import { Text } from '@ui-kitten/components';
import { Pressable } from 'react-native';

interface InlineLinkProps {
  label: string;
  onPress: () => void;
}

const InlineLink = ({ label, onPress }: InlineLinkProps) => {
  return (
    <Pressable onPress={onPress}>
      <Text status="success">{label}</Text>
    </Pressable>
  );
};

export default InlineLink;
