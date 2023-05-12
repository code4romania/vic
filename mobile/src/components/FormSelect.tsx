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

export interface ISelectItem {
  label: string;
  key: string;
}

interface FormSelectProps extends SelectProps {
  control: Control<Record<string, any>>;
  options: ISelectItem[];
  name: string;
  label: string;
  placeholder: string;
  error: any;
  required?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  control,
  options,
  name,
  label,
  placeholder,
  error,
  required,
  ...rest
}: FormSelectProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.container}>
      <Text category="p1">
        {label}
        {required ? <Text status={error ? 'danger' : 'basic'}>*</Text> : ''}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Select
            placeholder={placeholder}
            status={error ? 'danger' : 'basic'}
            value={options.find((option) => option.key === value)?.label}
            onSelect={(selectedItem: IndexPath | IndexPath[]) => {
              onChange(options[(selectedItem as IndexPath).row].key);
            }}
            style={styles.select}
            onBlur={onBlur}
            {...rest}
          >
            {options.map((option) => (
              <SelectItem key={option.key} title={option.label} />
            ))}
          </Select>
        )}
        defaultValue=""
      />
      {error && (
        <Text category="c1" status={error ? 'danger' : 'basic'}>
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
  select: {
    shadowColor: '$input-shadow-color',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 6,
  },
});
