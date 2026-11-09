import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VText } from './VText';
import { colors, radius, StatusTone } from '../../common/theme/tokens';

export interface BadgeProps {
  label: string;
  tone?: StatusTone;
}

/** Status badge: ok (green), wait (amber), no (red), neutral (gray), accent (yellow). */
export const Badge = ({ label, tone = 'neutral' }: BadgeProps) => {
  const c = colors.status[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <VText variant="cap" color={c.fg} style={styles.label} numberOfLines={1}>
        {label}
      </VText>
    </View>
  );
};

export default Badge;

const styles = StyleSheet.create({
  badge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: radius.badge,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  label: { fontFamily: 'roboto-bold' },
});
