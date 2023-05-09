import React from 'react';
import { Input, InputProps, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { Control, Controller } from 'react-hook-form';
import { View, Keyboard } from 'react-native';

interface FormInputProps extends InputProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  error: any;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  label,
  placeholder,
  secureTextEntry = false,
  error,
  required,
  ...rest
}: FormInputProps) => {
  const styles = useStyleSheet(themedStyles);

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text category="p1">
        {label}
        {required && <Text status={error ? 'danger' : 'basic'}>*</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            status={error ? 'danger' : 'basic'}
            textStyle={error ? styles.redText : {}}
            {...rest}
            onSubmitEditing={handleKeyboardDismiss}
          />
        )}
        defaultValue=""
      />
      {error && <Text status={error ? 'danger' : 'basic'}>{error.message}</Text>}
    </View>
  );
};

export default FormInput;

const themedStyles = StyleService.create({
  container: {
    gap: 4,
  },
  redText: {
    color: '$color-danger-500',
  },
});
