import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { FloatingHexagon } from '../design/components/EmptyState';

/** Full-screen loading „Îndrăzneț”: the VIC hexagon floating on paper (still with Reduce Motion). */
const LoadingScreen = () => {
  const { t } = useTranslation('general');
  return (
    <View
      style={styles.loadingContainer}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${t('loading')}`}
      testID="loading-screen"
    >
      <FloatingHexagon size={48} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
}));

export default LoadingScreen;
