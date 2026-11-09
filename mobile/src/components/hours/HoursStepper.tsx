import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius } from '../../common/theme/tokens';
import { PressableScale, VText } from '../ui';

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

/** "Număr de ore" with − and + (canvas boards Ore and OraDetaliu). */
export const HoursStepper = ({
  label,
  value,
  onChange,
  min = 1,
  max = 300,
  error,
  disabled,
  testID = 'hours-stepper',
}: HoursStepperProps) => {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, (value || 0) + delta)));
  return (
    <View style={styles.wrap}>
      <View style={[styles.box, !!error && styles.boxError]} testID={testID}>
        <View style={styles.text}>
          <VText variant="cap">{label}</VText>
          <VText style={styles.value} testID={`${testID}-value`}>
            {`${value || 0}h`}
          </VText>
        </View>
        <PressableScale
          onPress={() => step(-1)}
          disabled={disabled || value <= min}
          style={[styles.button, (disabled || value <= min) && styles.off]}
          accessibilityLabel="−1"
          testID={`${testID}-minus`}
        >
          <VText style={styles.sign}>−</VText>
        </PressableScale>
        <PressableScale
          onPress={() => step(1)}
          disabled={disabled || value >= max}
          style={[styles.button, (disabled || value >= max) && styles.off]}
          accessibilityLabel="+1"
          testID={`${testID}-plus`}
        >
          <VText style={styles.sign}>+</VText>
        </PressableScale>
      </View>
      {!!error && (
        <VText variant="cap" color={colors.danger}>
          {error}
        </VText>
      )}
    </View>
  );
};

export default HoursStepper;

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 10,
  },
  boxError: { borderColor: colors.danger },
  text: { flex: 1, gap: 2 },
  value: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.ink },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: { opacity: 0.4 },
  sign: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 24, color: colors.ink },
});
