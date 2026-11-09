import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { VText } from './VText';
import { colors, radius } from '../../common/theme/tokens';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  testID?: string;
}

/** Filter chip, 36 high. Selected chips are filled ink with white text. */
export const Chip = ({ label, selected, onPress, icon, testID }: ChipProps) => (
  <PressableScale
    testID={testID}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: !!selected }}
    accessibilityLabel={label}
    style={[styles.chip, selected ? styles.on : null]}
  >
    {icon}
    <VText variant="label" color={selected ? colors.white : colors.ink} numberOfLines={1}>
      {label}
    </VText>
  </PressableScale>
);

export default Chip;

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  on: { backgroundColor: colors.navy, borderColor: colors.navy },
});
