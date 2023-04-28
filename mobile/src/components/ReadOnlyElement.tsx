import { Text } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ReadOnlyElementProps {
  label: string;
  text: string;
}

const ReadOnlyElement = ({ label, text }: ReadOnlyElementProps) => {
  return (
    <View style={styles.container}>
      <Text category="c1">{label}</Text>
      <Text category="p1" appearance="hint">
        {text}
      </Text>
    </View>
  );
};

export default ReadOnlyElement;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
