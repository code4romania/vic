import React from 'react';
import { Button as ButtonKitten, StyleService, useStyleSheet } from '@ui-kitten/components';
import { TouchableOpacity } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import { ButtonBackgroundColorMapper } from '../common/utils/utils';

interface ButtonProps {
  label: string;
  type: ButtonType;
  onPress: () => void;
}

const Button = ({ label, onPress, type }: ButtonProps) => {
  const styles = useStyleSheet(themedStyles(type));

  return (
    <ButtonKitten
      onPress={onPress}
      style={styles.button}
      status={type === ButtonType.DANGER ? 'danger' : 'success'}
      appearance={type === ButtonType.SECONDARY ? 'outline' : 'filled'}
      size="large"
    >
      {label}
    </ButtonKitten>
  );
};

export default Button;

const shadow = {
  elevation: 4,
  shadowColor: '#280056',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.24,
  shadowRadius: 8,
};

const themedStyles = (type: ButtonType) =>
  StyleService.create({
    button: {
      borderRadius: 100,
      paddingVertical: 15,
      paddingHorizontal: 30,
      ...(type === ButtonType.SECONDARY ? {} : shadow),
    },
  });
