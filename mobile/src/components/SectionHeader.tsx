import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const SectionHeader = ({ title, icon, action }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    {icon}
    <Text category="p2" status="info">
      {title}
    </Text>
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
