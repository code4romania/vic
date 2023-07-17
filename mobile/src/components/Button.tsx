import React from 'react';
import {
  Button as ButtonKitten,
  ButtonProps as ButtonKittenProps,
  Spinner,
  useTheme,
} from '@ui-kitten/components';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';

export interface ButtonProps extends ButtonKittenProps {
  label: string;
  onPress: (props?: any) => void;
  loading?: boolean;
}

const LoadingIndicator = (): React.ReactElement => (
  <View style={styles.indicator}>
    <Spinner size="small" />
  </View>
);

const Button = ({ label, onPress, appearance, loading, ...props }: ButtonProps) => {
  const theme = useTheme();
  return (
    <ButtonKitten
      {...props}
      appearance={appearance || 'filled'}
      onPress={onPress}
      style={[
        styles.button,
        appearance === 'outline' ? null : { ...styles.shadow, shadowColor: theme['dark-purple'] },
        props.style,
      ]}
      accessoryLeft={loading ? <LoadingIndicator /> : <></>}
      size="large"
    >
      {label}
    </ButtonKitten>
  );
};

export default Button;

const styles = StyleSheet.create({
  shadow: {
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },
  button: {
    minWidth: 240,
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
