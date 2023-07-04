import React from 'react';
import { Text } from '@ui-kitten/components';
import { StyleSheet, TextStyle } from 'react-native';

interface ParagraphProps {
  children: string;
  style?: TextStyle;
}

const Paragraph = ({ children, style }: ParagraphProps) => (
  <Text
    style={{ ...styles.paragraph, ...style }}
    category="p1"
    ellipsizeMode="tail"
    numberOfLines={3}
  >
    {children}
  </Text>
);

export default Paragraph;

const styles = StyleSheet.create({
  paragraph: {
    textAlign: 'left',
    lineHeight: 24,
  },
});
