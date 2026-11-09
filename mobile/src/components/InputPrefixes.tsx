import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../common/theme/tokens';
import { VText } from './ui';

/** "+40" before a Romanian phone number. */
export const renderPhoneNumberPrefix = () => (
  <View style={styles.phonePrefix}>
    <VText variant="body" color={colors.muted}>
      +40
    </VText>
  </View>
);

const styles = StyleSheet.create({
  phonePrefix: {
    borderRightWidth: 1,
    borderRightColor: colors.line,
    paddingRight: 6,
  },
});
