import React from 'react';
import {
  IndexPath,
  Select,
  SelectItem,
  SelectProps,
  StyleService,
  Text,
  useStyleSheet,
} from '@ui-kitten/components';
import { Control, Controller } from 'react-hook-form';
import { View } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

export interface ISelectItem {
  label: string;
  key: string | number;
}

export interface FormSelectProps extends SelectProps {
  control: Control<Record<string, any>>;
  options: ISelectItem[];
  name: string;
  label: string;
  placeholder: string;
  error: any;
  required?: boolean;
}

const renderSelectedItem = (label: string | undefined, styles: any) => {
  return label
    ? () => (
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.marginHorizontal}>
          {label}
        </Text>
      )
    : label;
};

const renderPlaceholder = (placeholder: string, styles: any) => {
  return () => (
    <Text allowFontScaling={ALLOW_FONT_SCALLING} appearance="hint" style={styles.marginHorizontal}>
      {placeholder}
    </Text>
  );
};

const FormSelect: React.FC<FormSelectProps> = ({
  control,
  options,
  name,
  label,
  placeholder,
  error,
  required,
  disabled,
  ...rest
}: FormSelectProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.container}>
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">
        {label}
        {required ? <Text status="danger">*</Text> : ''}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => {
          if (value !== undefined) {
            value = renderSelectedItem(
              options.find((option) => option.key === value)?.label,
              styles,
            );
          }

          return (
            <View style={styles.controlContainer}>
              <Select
                placeholder={renderPlaceholder(placeholder, styles)}
                status={error ? 'danger' : 'basic'}
                value={value}
                onSelect={(selectedItem: IndexPath | IndexPath[]) => {
                  onChange(options[(selectedItem as IndexPath).row].key);
                }}
                style={styles.select}
                disabled={disabled}
                onBlur={onBlur}
                {...rest}
              >
                {options.map((option) => (
                  <SelectItem key={option.key} title={option.label} />
                ))}
              </Select>
              {disabled && <View style={styles.disabled} />}
            </View>
          );
        }}
      />
      {error && (
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          category="c1"
          status={error ? 'danger' : 'basic'}
        >
          {error.message}
        </Text>
      )}
    </View>
  );
};

export default FormSelect;

const themedStyles = StyleService.create({
  container: {
    gap: 4,
  },
  marginHorizontal: {
    marginHorizontal: 8,
  },
  select: {
    shadowColor: '$input-shadow-color',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 6,
  },
  controlContainer: { position: 'relative' },
  disabled: {
    height: '100%',
    backgroundColor: '$cool-gray-500',
    width: '100%',
    position: 'absolute',
    opacity: 0.1,
  },
});
