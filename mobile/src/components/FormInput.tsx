import React from 'react';
import { InputProps, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { Control, Controller } from 'react-hook-form';
import { View, Keyboard } from 'react-native';
import Input from './Input';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface FormInputProps extends InputProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  error: any;
  helper?: string;
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
  helper,
  ...rest
}: FormInputProps) => {
  const styles = useStyleSheet(themedStyles);

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">
        {label}
        {required ? <Text status="danger">*</Text> : ''}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            allowFontScaling={ALLOW_FONT_SCALLING}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            status={error ? 'danger' : 'basic'}
            textStyle={
              rest.disabled
                ? [styles.disabledColor, styles.inputText, rest.multiline ? styles.textArea : {}]
                : [
                    styles.inputText,
                    rest.multiline ? styles.textArea : {},
                    error ? styles.redText : {},
                  ]
            }
            style={error ? styles.redBorder : {}}
            {...rest}
            onSubmitEditing={handleKeyboardDismiss}
          />
        )}
      />
      {(error || helper) && (
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          category="c1"
          status={error ? 'danger' : 'basic'}
          appearance={error ? 'default' : 'hint'}
        >
          {error?.message || helper}
        </Text>
      )}
    </View>
  );
};

export default FormInput;

const themedStyles = StyleService.create({
  container: {
    gap: 4,
  },
  redBorder: {
    borderColor: '$color-danger-500',
  },
  redText: {
    color: '$color-danger-500',
  },
  disabledColor: { color: '$cool-gray-500' },
  inputText: { fontSize: 16, fontWeight: '400' },
  textArea: {
    minHeight: 52,
  },
});
