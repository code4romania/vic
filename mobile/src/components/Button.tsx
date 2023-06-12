import React from 'react';
import {
  Button as ButtonKitten,
  ButtonProps as ButtonKittenProps,
  Text,
  withStyles,
} from '@ui-kitten/components';

export interface ButtonProps extends ButtonKittenProps {
  label: string;
  onPress: (props?: any) => void;
  eva?: any;
}

const Button = ({ label, onPress, eva, appearance, ...props }: ButtonProps) => {
  return (
    <ButtonKitten
      {...props}
      appearance={appearance || 'filled'}
      onPress={onPress}
      style={[
        eva.style.button,
        appearance === 'outline' || appearance === 'ghost' ? null : eva.style.shadow,
        props.style,
      ]}
      size="large"
    >
      {(textProps) => <Text style={[textProps?.style, eva.style.textCenter]}>{label}</Text>}
    </ButtonKitten>
  );
};

export default withStyles(Button, (theme) => ({
  shadow: {
    elevation: 4,
    shadowColor: theme['dark-purple'],
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
  textCenter: {
    textAlign: 'center',
  },
}));
