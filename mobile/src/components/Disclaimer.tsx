import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from '../design/components/Text';
import { palette } from '../design/tokens';

interface DisclaimerProps {
  /** dot color: a palette name (green, red, orange, yellow, navy, slate) or any color */
  color: string;
  text: string;
}

const DOT_COLORS: Record<string, string> = {
  green: palette.green,
  red: palette.red,
  orange: palette.orange,
  yellow: palette.yellow,
  navy: palette.navy,
  slate: palette.slate,
};

/** A short note on a white strip with a solid status dot. */
const Disclaimer = ({ color, text }: DisclaimerProps) => (
  <View style={styles.container}>
    <View style={[styles.dot, { backgroundColor: DOT_COLORS[color] ?? color }]} />
    <AppText variant="caption" color={palette.ink2} style={styles.text}>
      {text}
    </AppText>
  </View>
);

export default Disclaimer;

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: theme.space.s,
    paddingHorizontal: theme.space.l,
    flexDirection: 'row',
    gap: theme.space.xs,
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.card,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { flex: 1 },
}));
