import React from 'react';
import { Text } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

interface ParagraphProps {
  children: string;
}

const Paragraph = ({ children }: ParagraphProps) => (
  <Text style={styles.paragraph} category="p1" ellipsizeMode="tail" numberOfLines={3}>
    {children}
  </Text>
);

export default Paragraph;

const styles = StyleSheet.create({
  paragraph: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
