import React from 'react';
import { View, StyleSheet } from 'react-native';

interface FormLayoutProps {
  children: React.ReactNode;
}

const FormLayout = ({ children }: FormLayoutProps) => {
  return <View style={styles.layout}>{children}</View>;
};

export default FormLayout;

const styles = StyleSheet.create({
  layout: { gap: 16 },
});
