import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VText } from './ui';

interface ReadOnlyElementProps {
  label: string;
  value?: string;
}

/** A label over its value, read only (VIC 2.0 `cap` + `body`). */
const ReadOnlyElement = ({ label, value }: ReadOnlyElementProps) => (
  <View style={styles.container}>
    <VText variant="cap">{label}</VText>
    <VText variant="body">{value || '–'}</VText>
  </View>
);

export default ReadOnlyElement;

const styles = StyleSheet.create({
  container: { gap: 4 },
});
