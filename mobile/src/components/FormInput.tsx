import React from 'react';
import { Input, InputProps, Text } from '@ui-kitten/components';
import { Control, Controller } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';

interface FormInputProps extends InputProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  rules: Object;
  secureTextEntry?: boolean;
  error: any;
}

const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  label,
  placeholder,
  rules,
  secureTextEntry = false,
  error,
  ...rest
}: FormInputProps) => {
  return (
    <View style={styles.container}>
      <Text category="p1">{label}</Text>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...rest}
          />
        )}
        defaultValue=""
      />
      {error && <Text>{error.message}</Text>}
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
