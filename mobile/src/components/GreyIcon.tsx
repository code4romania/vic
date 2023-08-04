import React from 'react';
import { Icon, IconProps, useTheme } from '@ui-kitten/components';
import { View, StyleSheet } from 'react-native';

interface IGrayIconProps extends IconProps {
  backgroundColor?: string;
}

const GrayIcon = (props: IGrayIconProps) => {
  const theme = useTheme();
  const { backgroundColor, ...otherProps } = props;
  console.log('lalsdas', backgroundColor);

  return (
    <View
      style={[{ backgroundColor: theme[backgroundColor || 'cool-gray-100'] }, styles.container]}
    >
      <Icon {...otherProps} style={[{ color: theme['cool-gray-500'] }, styles.icon, props.style]} />
    </View>
  );
};

export default GrayIcon;

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 24,
  },
});
