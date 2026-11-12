import React from 'react';
import { Stepper } from '../../design/components/Stepper';

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

// „o oră”, „5 ore”, „20 de ore” (Romanian adds „de” from 20 up)
const spokenHours = (hours: number) =>
  hours === 1
    ? 'o oră'
    : hours % 100 >= 20 || (hours > 0 && hours % 100 === 0)
      ? `${hours} de ore`
      : `${hours} ore`;

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
}: HoursStepperProps) => (
  <Stepper
    label={label}
    value={value || 0}
    onChange={onChange}
    min={min}
    max={max}
    error={error}
    disabled={disabled}
    formatValue={(hours) => `${hours}h`}
    accessibilityValueText={spokenHours}
    decrementLabel="O oră mai puțin"
    incrementLabel="O oră în plus"
    testID={testID}
  />
);

export default HoursStepper;
