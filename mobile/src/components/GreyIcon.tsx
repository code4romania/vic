import React from 'react';
import { Icon, IconProps, StyleService, useStyleSheet } from '@ui-kitten/components';
import { View } from 'react-native';

const GrayIcon = (props: IconProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.container}>
      <Icon {...props} style={styles.icon} />
    </View>
  );
};

export default GrayIcon;

const themedStyles = StyleService.create({
  container: {
    width: 48,
    height: 48,
    backgroundColor: '$cool-gray-100',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 24,
    color: '$cool-gray-500',
  },
});
