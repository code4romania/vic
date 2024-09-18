import { Layout, withStyles } from '@ui-kitten/components';
import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface ScrollViewLayoutProps {
  children: ReactNode;
  eva?: any;
  style?: any;
}

const ScrollViewLayout = ({ children, eva, style }: ScrollViewLayoutProps) => (
  <ScrollView
    bouncesZoom={false}
    alwaysBounceHorizontal={false}
    alwaysBounceVertical={false}
    bounces={false}
    showsVerticalScrollIndicator={false}
    style={[eva?.style.background, style]}
  >
    <Layout style={styles.layout}>{children}</Layout>
  </ScrollView>
);

const styles = StyleSheet.create({
  layout: { flex: 1, gap: 24 },
});

export default withStyles(ScrollViewLayout, (theme) => ({
  background: {
    backgroundColor: theme['color-basic-100'],
  },
}));
