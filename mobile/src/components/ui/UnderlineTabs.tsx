import React, { ReactNode } from 'react';
import { SegmentedControl } from '../../design/components/SegmentedControl';

export interface UnderlineTab<T extends string> {
  key: T;
  label: string;
  /**
   * Kept for API compatibility. The „Îndrăzneț” redesign draws category tabs as the segmented
   * control (text only), so the icon is no longer shown.
   */
  icon?: (active: boolean) => ReactNode;
  count?: number;
}

export interface UnderlineTabsProps<T extends string> {
  tabs: UnderlineTab<T>[];
  value: T;
  onChange: (key: T) => void;
  testID?: string;
}

/**
 * Category tabs. In „Îndrăzneț” they are the segmented control: a navy track with a yellow thumb
 * that slides and resizes to the active tab (`${testID}-indicator`).
 */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  testID,
}: UnderlineTabsProps<T>) {
  return (
    <SegmentedControl<T>
      options={tabs.map(({ key, label, count }) => ({ key, label, count }))}
      value={value}
      onChange={onChange}
      testID={testID}
    />
  );
}

export default UnderlineTabs;
