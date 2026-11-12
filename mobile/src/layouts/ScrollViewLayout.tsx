import React, { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ScrollViewLayoutProps {
  children: ReactNode;
}

/** Plain scrolling page on paper, 24pt between blocks. */
const ScrollViewLayout = ({ children }: ScrollViewLayoutProps) => (
  <ScrollView
    bouncesZoom={false}
    alwaysBounceHorizontal={false}
    alwaysBounceVertical={false}
    bounces={false}
    showsVerticalScrollIndicator={false}
    style={styles.scroll}
  >
    <View style={styles.layout}>{children}</View>
  </ScrollView>
);

export default ScrollViewLayout;

const styles = StyleSheet.create((theme) => ({
  scroll: { backgroundColor: theme.colors.background },
  layout: { flex: 1, gap: 24 },
}));
