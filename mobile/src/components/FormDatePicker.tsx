import React from 'react';
import { DatepickerProps } from '@ui-kitten/components';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { datePickerService } from '../common/utils/birthday';
import { DateField } from '../design/components/DateField';

interface FormDatepickerProps extends DatepickerProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  error: any;
  required?: boolean;
  /** quick options „Azi” / „Ieri” under the field (for days of activity, not for birthdays) */
  quickOptions?: boolean;
}

/**
 * react-hook-form date on the „Îndrăzneț” DateField: label above, the date written out, a calendar
 * that unfolds under the field. Pass min / max so the user can also pick the year.
 */
const FormDatePicker: React.FC<FormDatepickerProps> = ({
  control,
  name,
  label,
  placeholder,
  error,
  required,
  disabled,
  quickOptions = false,
  min,
  max,
  initialVisibleDate,
  testID,
  filter,
  startView,
}: FormDatepickerProps) => {
  const { i18n } = useTranslation();
  const dateService = React.useMemo(() => datePickerService(i18n.language), [i18n.language]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <DateField
          label={label}
          required={required}
          placeholder={placeholder}
          value={value ?? null}
          onChange={onChange}
          onBlur={onBlur}
          error={error?.message}
          disabled={!!disabled}
          minimumDate={min}
          maximumDate={max}
          // open on the chosen date when there is one, else on the hint (e.g. a plausible year)
          initialVisibleDate={initialVisibleDate}
          dateService={dateService}
          quickOptions={quickOptions}
          calendarProps={{ ...(filter ? { filter } : {}), ...(startView ? { startView } : {}) }}
          testID={testID ?? `date-${name}`}
        />
      )}
    />
  );
};

export default FormDatePicker;
