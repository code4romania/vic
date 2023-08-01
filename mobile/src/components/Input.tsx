import {
  InputProps,
  Input as KittenInput,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components';
import React from 'react';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

const Input = (props: InputProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <KittenInput
      allowFontScaling={ALLOW_FONT_SCALLING}
      textStyle={[styles.inputText, props.disabled ? styles.disabledColor : {}]}
      {...props}
      style={[styles.input, props.style, props.disabled ? styles.disabledBackground : {}]}
    />
  );
};

const themedStyles = StyleService.create({
  input: {
    shadowColor: '$input-shadow-color',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 6,
  },
  disabledBackground: { backgroundColor: '$cool-gray-100' },
  disabledColor: { color: '$cool-gray-500' },
  inputText: { fontSize: 16, fontWeight: '400' },
});

export default Input;
