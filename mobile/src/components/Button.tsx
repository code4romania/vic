import React from 'react';
import {
  Button as ButtonKitten,
  ButtonProps as ButtonKittenProps,
  withStyles,
} from '@ui-kitten/components';
import { ButtonType } from '../common/enums/button-type.enum';

interface ButtonProps extends ButtonKittenProps {
  label: string;
  type: ButtonType;
  onPress: (props?: any) => void;
  eva?: any;
}

const Button = ({ label, onPress, type, eva }: ButtonProps) => {
  return (
    <ButtonKitten
      onPress={onPress}
      style={[eva.style.button, type === ButtonType.SECONDARY ? null : eva.style.shadow]}
      status={type === ButtonType.DANGER ? 'danger' : 'success'}
      appearance={type === ButtonType.SECONDARY ? 'outline' : 'filled'}
      size="large"
    >
      {label}
    </ButtonKitten>
  );
};

export default withStyles(Button, () => ({
  shadow: {
    elevation: 4,
    shadowColor: '$dark-purple',
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
}));
