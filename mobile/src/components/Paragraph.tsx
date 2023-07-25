import React from 'react';
import { Text, useTheme } from '@ui-kitten/components';
import { StyleSheet, TextStyle } from 'react-native';

interface ParagraphProps {
  children: string;
  style?: TextStyle;
}

const Paragraph = ({ children, style }: ParagraphProps) => {
  const theme = useTheme();

  return (
    <Text
      style={{ color: theme['cool-gray-500'], ...styles.paragraph, ...style }}
      category="p1"
      ellipsizeMode="tail"
      numberOfLines={3}
    >
      {children}
    </Text>
  );
};

export default Paragraph;

const styles = StyleSheet.create({
  paragraph: {
    textAlign: 'left',
    lineHeight: 24,
  },
});
