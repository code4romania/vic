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
import { StyleSheet, View } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { colors, radius } from '../common/theme/tokens';
import { VText } from './ui';

interface FormDatepickerProps extends DatepickerProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  error: any;
  required?: boolean;
}

const CalendarIcon = (props: any): IconElement => <Icon {...props} name="calendar" />;
const renderPlaceholder = (placeholder: string, styles: any) => () => (
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
      <VText variant="cap">{required ? `${label} *` : label}</VText>
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
            controlStyle={[
              fieldStyles.control,
              error ? fieldStyles.invalid : null,
              disabled ? styles.disabled : null,
            ]}
            accessoryRight={CalendarIcon}
            {...rest}
          />
        )}
      />
      {!!error?.message && (
        <VText variant="cap" color={colors.danger}>
          {error.message}
        </VText>
      )}
    </View>
  );
};

export default FormDatePicker;

const themedStyles = StyleService.create({
  container: {
    gap: 6,
  },
  marginHorizontal: {
    marginHorizontal: 8,
  },
  input: {
    borderRadius: 12,
  },
  disabled: {
    backgroundColor: '$cool-gray-100',
  },
});

// VIC 2.0 field look (same box as VTextField)
const fieldStyles = StyleSheet.create({
  control: {
    minHeight: 56,
    borderRadius: radius.field,
    borderColor: colors.subtle,
    backgroundColor: colors.white,
  },
  invalid: { borderColor: colors.danger },
});
