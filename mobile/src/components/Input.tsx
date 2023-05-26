import { InputProps, Input as KittenInput, StyleService } from '@ui-kitten/components';
import React from 'react';

const Input = (props: InputProps) => (
  <KittenInput
    style={[styles.input, props.disabled ? styles.disabledBackground : {}]}
    textStyle={styles.inputText}
    {...props}
  />
);

const styles = StyleService.create({
  input: {
    shadowColor: '$input-shadow-color',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 6,
  },
  disabledBackground: { backgroundColor: '$cool-gray-100' },
  inputText: { fontSize: 16, fontWeight: '400' },
});

export default Input;
