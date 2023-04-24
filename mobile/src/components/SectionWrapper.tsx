import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';

interface SectionWrapperProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

const SectionWrapper = ({ title, children, icon, action }: SectionWrapperProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text category="p2" status="info">
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    gap: 18,
    flexDirection: 'column',
    backgroundColor: 'red',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default SectionWrapper;
