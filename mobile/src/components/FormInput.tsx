import React from 'react';
import { Keyboard, TextInputProps } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { VTextField } from './ui';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  error: any;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  /** element or ui-kitten style render function, e.g. the +40 phone prefix */
  accessoryLeft?: React.ReactNode | ((props: any) => React.ReactNode);
  [key: string]: any;
}

/** react-hook-form field in the VIC 2.0 style (label inside an outlined box). */
const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  label,
  placeholder,
  secureTextEntry = false,
  error,
  required,
  helper,
  disabled,
  accessoryLeft,
  backdropComponent: _backdropComponent,
  ...rest
}: FormInputProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, onBlur, value } }) => (
      <VTextField
        label={required ? `${label} *` : label}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value === undefined || value === null ? '' : `${value}`}
        error={error?.message}
        helper={helper}
        editable={!disabled}
        leading={typeof accessoryLeft === 'function' ? accessoryLeft({}) : accessoryLeft}
        onSubmitEditing={() => Keyboard.dismiss()}
        testID={`field-${name}`}
        {...rest}
      />
    )}
  />
);

export default FormInput;
