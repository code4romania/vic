import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const SectionHeader = ({ title, icon, action }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2" status="info">
      {title}
    </Text>
    {icon}
    {action}
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
  },
});

export default SectionHeader;
