import React from 'react';
import { Button as ButtonKitten, withStyles, Text } from '@ui-kitten/components';
import { ButtonProps } from './Button';
import FacebookSvg from '../assets/svg/facebook';
import { SvgXml } from 'react-native-svg';

const FacebookButton = ({ label, onPress, eva, ...props }: Omit<ButtonProps, 'type'>) => {
  return (
    <ButtonKitten
      {...props}
      onPress={onPress}
      style={[eva.style.button, eva.style.shadow, props.style]}
      appearance="ghost"
      size="large"
      accessoryLeft={<SvgXml xml={FacebookSvg} />}
    >
      {() => (
        <Text style={eva.style.label} category="label">
          {label}
        </Text>
      )}
    </ButtonKitten>
  );
};

export default withStyles(FacebookButton, (theme) => ({
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
    backgroundColor: theme['facebook-color'],
  },
  label: {
    color: 'white',
  },
}));
