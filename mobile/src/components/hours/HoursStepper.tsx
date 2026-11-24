import React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Stepper } from '../../design/components/Stepper';
import { romanianNeedsDe } from '../../common/utils/plural';

export interface HoursStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

// „o oră”, „5 ore”, „20 de ore” (Romanian adds „de” from 20 up); "one hour", "5 hours"
export const spokenHours = (t: TFunction, hours: number): string =>
  hours === 1
    ? `${t('activity_log:form.hours.spoken_one')}`
    : `${t(
        romanianNeedsDe(hours)
          ? 'activity_log:form.hours.spoken_de'
          : 'activity_log:form.hours.spoken',
        { hours },
      )}`;

/** "Număr de ore" on the „Îndrăzneț” Stepper: − and +, the value „4h” rolls between them. */
export const HoursStepper = ({
  label,
  value,
  onChange,
  min = 1,
  max = 24,
  error,
  disabled,
  testID = 'hours-stepper',
}: HoursStepperProps) => {
  const { t } = useTranslation();
  return (
    <Stepper
      label={label}
      value={value || 0}
      onChange={onChange}
      min={min}
      max={max}
      error={error}
      disabled={disabled}
      formatValue={(hours) => `${hours}h`}
      accessibilityValueText={(hours) => spokenHours(t, hours)}
      decrementLabel={`${t('activity_log:form.hours.one_less')}`}
      incrementLabel={`${t('activity_log:form.hours.one_more')}`}
      testID={testID}
    />
  );
};

export default HoursStepper;
