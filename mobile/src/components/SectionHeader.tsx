import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from '../design/components/Text';
import { palette } from '../design/tokens';

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** Section title „Îndrăzneț”: an overline in secondary ink, with an optional icon and action. */
const SectionHeader = ({ title, icon, action }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <AppText variant="overline" color={palette.ink2} accessibilityRole="header">
      {title}
    </AppText>
    {icon}
    {action}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
  },
}));

export default SectionHeader;
