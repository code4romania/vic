import { Text } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ReadOnlyElementProps {
  label: string;
  value?: string;
}

const ReadOnlyElement = ({ label, value }: ReadOnlyElementProps) => {
  return (
    <View style={styles.container}>
      <Text category="c1" appearance="hint">
        {label}
      </Text>
      <Text>{value || '-'}</Text>
    </View>
  );
};

export default ReadOnlyElement;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
