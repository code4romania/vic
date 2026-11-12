import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DateField } from '../design/components/DateField';

interface FormDatepickerProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  placeholder: string;
  error: any;
  required?: boolean;
  /** quick options „Azi” / „Ieri” under the field (for days of activity, not for birthdays) */
  quickOptions?: boolean;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  /** month the calendar opens on when there is no value */
  initialVisibleDate?: Date;
  /** open the calendar on the year grid (e.g. for a birthday) */
  startView?: 'day' | 'year';
  testID?: string;
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
  startView,
}: FormDatepickerProps) => {
  const { i18n } = useTranslation();

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
          language={i18n.language === 'en' ? 'en' : 'ro'}
          quickOptions={quickOptions}
          startView={startView}
          testID={testID ?? `date-${name}`}
        />
      )}
    />
  );
};

export default FormDatePicker;
