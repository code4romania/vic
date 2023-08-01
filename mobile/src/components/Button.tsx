/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Button as ButtonKitten,
  ButtonProps as ButtonKittenProps,
  Spinner,
  useTheme,
  Text,
} from '@ui-kitten/components';
import { Platform, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

export interface ButtonProps extends ButtonKittenProps {
  label: string;
  onPress: (props?: any) => void;
  loading?: boolean;
}

const LoadingIndicator = (): React.ReactElement => (
  <View style={styles.indicator}>
    <Spinner size="small" status="basic" />
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
        props.disabled ? { ...Platform.select({ android: { elevation: 1 } }) } : {},
      ]}
      accessoryLeft={loading ? <LoadingIndicator /> : <></>}
      size="large"
    >
      {() => (
        <Text
          category="p2"
          style={[
            appearance === 'outline' ? { color: theme['color-success-500'] } : { color: 'white' },
          ]}
          allowFontScaling={ALLOW_FONT_SCALLING}
        >
          {label}
        </Text>
      )}
    </ButtonKitten>
  );
};

export default Button;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: 'gray',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowOffset: { width: 2, height: 2.5 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
    }),
  },
  button: {
    minWidth: 240,
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  indicator: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
