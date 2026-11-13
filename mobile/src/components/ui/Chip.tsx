import React, { ReactNode } from 'react';
import { OptionChip } from '../../design/components/Chip';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  testID?: string;
}

/**
 * Filter chip, now the „Îndrăzneț” quick option: 34 high, navy with yellow text when selected.
 * Long organization names wrap and the chip grows with its text.
 */
export const Chip = ({ label, selected, onPress, icon, testID }: ChipProps) => (
  <OptionChip label={label} selected={!!selected} onPress={onPress} icon={icon} testID={testID} />
);

export default Chip;
