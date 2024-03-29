import React from 'react';
import {
  Datepicker,
  DatepickerProps,
  Icon,
  IconElement,
  StyleService,
  Text,
  useStyleSheet,
} from '@ui-kitten/components';
import { Control, Controller } from 'react-hook-form';
import { View } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface FormDatepickerProps extends DatepickerProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  error: any;
  required?: boolean;
}

const CalendarIcon = (props: any): IconElement => <Icon {...props} name="calendar" />;
const renderPlaceholder = (placeholder: string, styles: any) => () =>
  (
    <Text allowFontScaling={ALLOW_FONT_SCALLING} appearance="hint" style={styles.marginHorizontal}>
      {placeholder}
    </Text>
  );

//Add min or max props to date picker in order to let user select year
const FormDatePicker: React.FC<FormDatepickerProps> = ({
  control,
  name,
  label,
  placeholder,
  error,
  required,
  disabled,
  ...rest
}: FormDatepickerProps) => {
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
        render={({ field: { onChange, onBlur, value } }) => (
          <Datepicker
            placeholder={renderPlaceholder(placeholder, styles)}
            date={value}
            onSelect={onChange}
            onBlur={onBlur}
            status={error ? 'danger' : 'basic'}
            disabled={disabled}
            style={styles.input}
            controlStyle={disabled ? styles.disabled : {}}
            accessoryRight={CalendarIcon}
            {...rest}
          />
        )}
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

export default FormDatePicker;

const themedStyles = StyleService.create({
  container: {
    gap: 4,
  },
  marginHorizontal: {
    marginHorizontal: 8,
  },
  input: {
    shadowColor: '$input-shadow-color',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 6,
  },
  disabled: {
    backgroundColor: '$cool-gray-100',
  },
});
