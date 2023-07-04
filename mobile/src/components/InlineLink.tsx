import React from 'react';
import { Text, TextProps } from '@ui-kitten/components';
import { Pressable } from 'react-native';

interface InlineLinkProps extends TextProps {
  label: string;
  onPress: () => void;
}

const InlineLink = ({ label, onPress, ...rest }: InlineLinkProps) => {
  return (
    <Pressable onPress={onPress}>
      <Text status="success" {...rest}>
        {label}
      </Text>
    </Pressable>
  );
};

export default InlineLink;
