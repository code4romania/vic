import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import SectionHeader from './SectionHeader';

interface SectionWrapperProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

const SectionWrapper = ({ children, ...sectionHeaderProps }: SectionWrapperProps) => {
  return (
    <View style={styles.container}>
      <SectionHeader {...sectionHeaderProps} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
    flexDirection: 'column',
  },
});

export default SectionWrapper;
