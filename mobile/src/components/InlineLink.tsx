import React from 'react';
import { Pressable, StyleSheet, TextStyle } from 'react-native';
import { VText } from './ui';
import { colors, fonts } from '../common/theme/tokens';

interface InlineLinkProps {
  label: string;
  onPress: () => void;
  style?: TextStyle;
}

/** Underlined text link with a 44pt touch area (canvas `.link`). */
const InlineLink = ({ label, onPress, style }: InlineLinkProps) => (
  <Pressable onPress={onPress} hitSlop={12} accessibilityRole="link" style={styles.hit}>
    <VText variant="label" color={colors.ink} style={[styles.link, style]}>
      {label}
    </VText>
  </Pressable>
);

export default InlineLink;

const styles = StyleSheet.create({
  hit: { minHeight: 44, justifyContent: 'center' },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
});
