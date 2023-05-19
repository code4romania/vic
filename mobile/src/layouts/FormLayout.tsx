import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface FormLayoutProps {
  children: React.ReactNode;
}

const FormLayout = ({ children }: FormLayoutProps) => {
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets={true}
      bounces={false}
      bouncesZoom={false}
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.layout}
    >
      {children}
    </ScrollView>
  );
};

export default FormLayout;

const styles = StyleSheet.create({
  layout: { gap: 16, paddingBottom: 32 },
});
