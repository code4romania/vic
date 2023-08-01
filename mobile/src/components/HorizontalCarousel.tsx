import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface HorizontalCarouselProps {
  children: ReactNode;
}

const HorizontalCarousel = ({ children }: HorizontalCarouselProps) => (
  <ScrollView
    horizontal={true}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollView}
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollView: {
    gap: 16,
    paddingBottom: 16,
  },
});

export default HorizontalCarousel;
