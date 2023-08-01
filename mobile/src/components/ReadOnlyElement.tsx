import { Text } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface ReadOnlyElementProps {
  label: string;
  value?: string;
}

const ReadOnlyElement = ({ label, value }: ReadOnlyElementProps) => {
  return (
    <View style={styles.container}>
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1" appearance="hint">
        {label}
      </Text>
      <Text allowFontScaling={ALLOW_FONT_SCALLING}>{value || '-'}</Text>
    </View>
  );
};

export default ReadOnlyElement;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
