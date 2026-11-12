import React from 'react';
import {
  SegmentedControl as DesignSegmentedControl,
  SegmentedOption,
} from '../../design/components/SegmentedControl';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
  count?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
  testID?: string;
}

/** Legacy API over the „Îndrăzneț” segmented control: navy track, yellow thumb that slides. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>) {
  return (
    <DesignSegmentedControl<T>
      options={options as SegmentedOption<T>[]}
      value={value}
      onChange={onChange}
      testID={testID}
    />
  );
}

export default SegmentedControl;
