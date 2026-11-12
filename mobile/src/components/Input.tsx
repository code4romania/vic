import React, { forwardRef } from 'react';
import { TextInput } from 'react-native';
import { TextField, TextFieldProps } from '../design/components/TextField';

export interface InputProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  disabled?: boolean;
}

/** Legacy input name over the „Îndrăzneț” TextField. */
const Input = forwardRef<TextInput, InputProps>(({ label, disabled, ...props }, ref) => (
  <TextField
    ref={ref}
    {...props}
    label={label ?? ''}
    editable={disabled ? false : props.editable}
  />
));

Input.displayName = 'Input';

export default Input;
