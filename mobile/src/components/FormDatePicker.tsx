import React from 'react';
import {
  Datepicker,
  DatepickerProps,
  Icon,
  IconElement,
  StyleService,
  useStyleSheet,
} from '@ui-kitten/components';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { datePickerService } from '../common/utils/birthday';
import { StyleSheet, View } from 'react-native';
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
  <VText variant="body" color={colors.subtle} style={styles.marginHorizontal}>
    {placeholder}
  </VText>
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
  const { i18n } = useTranslation();
  const dateService = React.useMemo(() => datePickerService(i18n.language), [i18n.language]);

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
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
              dateService={dateService}
              {...rest}
              // open on the chosen date when there is one, else on the hint (e.g. a plausible year)
              initialVisibleDate={value || rest.initialVisibleDate}
            />
            {/* the label sits inside the box, like VTextField */}
            <VText variant="cap" style={fieldStyles.label} pointerEvents="none">
              {required ? `${label} *` : label}
            </VText>
          </View>
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
    paddingTop: 16,
    borderRadius: radius.field,
    borderColor: colors.subtle,
    backgroundColor: colors.white,
  },
  invalid: { borderColor: colors.danger },
  label: { position: 'absolute', top: 8, left: 16 },
});
