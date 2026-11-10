import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../common/theme/tokens';
import { VText } from './VText';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** the text next to the box; links inside it stay pressable on their own */
  children: ReactNode;
  error?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

/** VIC 2.0 checkbox: a 24pt box in a 44pt touch area, navy when checked. */
export const Checkbox = ({
  checked,
  onChange,
  children,
  error,
  disabled,
  accessibilityLabel,
  testID,
}: CheckboxProps) => (
  <View style={styles.wrapper}>
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(!checked)}
        disabled={disabled}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled: !!disabled }}
        accessibilityLabel={accessibilityLabel}
        style={styles.touch}
        testID={testID}
      >
        <View
          style={[styles.box, checked && styles.checked, !!error && !checked && styles.invalid]}
        >
          {checked && (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke={colors.white}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>
      </Pressable>
      <View style={styles.text}>{children}</View>
    </View>
    {!!error && (
      <VText variant="cap" color={colors.danger}>
        {error}
      </VText>
    )}
  </View>
);

export default Checkbox;

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  touch: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checked: { backgroundColor: colors.navy, borderColor: colors.navy },
  invalid: { borderColor: colors.danger },
  text: { flex: 1, paddingTop: 11 },
});
