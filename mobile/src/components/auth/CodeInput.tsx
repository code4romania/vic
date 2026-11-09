import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { VText } from '../ui/VText';
import { colors, fonts } from '../../common/theme/tokens';

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once all digits are typed (or pasted / autofilled from the email). */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  accessibilityLabel: string;
  testID?: string;
}

export interface CodeInputHandle {
  focus: () => void;
  clear: () => void;
}

/**
 * Six boxes for the email code (canvas `.box`). A single hidden TextInput takes the digits, so
 * paste and the iOS/Android one-time-code autofill work; the boxes only mirror it.
 */
export const CodeInput = forwardRef<CodeInputHandle, CodeInputProps>(
  (
    { value, onChange, onComplete, length = 6, disabled, error, accessibilityLabel, testID },
    ref,
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [focused, setFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => onChange(''),
    }));

    const onChangeText = (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, length);
      onChange(digits);
      if (digits.length === length) {
        onComplete?.(digits);
      }
    };

    return (
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false} style={styles.row}>
        {Array.from({ length }).map((_, index) => {
          const current = focused && index === Math.min(value.length, length - 1);
          return (
            <View
              key={index}
              style={[styles.box, current ? styles.current : null, error ? styles.error : null]}
            >
              <VText variant="h2" style={styles.digit}>
                {value[index] ?? ''}
              </VText>
            </View>
          );
        })}
        <TextInput
          ref={inputRef}
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={length}
          autoFocus
          caretHidden
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel}
          style={styles.hiddenInput}
        />
      </Pressable>
    );
  },
);

export default CodeInput;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  box: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  current: { borderWidth: 2, borderColor: colors.ink },
  error: { borderColor: colors.danger },
  digit: { fontFamily: fonts.title, fontSize: 26, lineHeight: 32 },
  // covers the boxes so a tap anywhere focuses it; invisible but still reachable by autofill
  hiddenInput: { ...StyleSheet.absoluteFill, opacity: 0.011, color: 'transparent' },
});
