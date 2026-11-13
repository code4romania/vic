// Code boxes „Îndrăzneț”: six white 56pt boxes like the TextField (no outline). The box waiting for
// the next digit gets the navy outline and the yellow halo; a wrong code turns them red on rose,
// shakes the row and plays the error haptic. Digits are Bricolage with tabular numbers.
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { useErrorShake, useFocusRing } from '../../design/components/TextField';
import { fontScaleCap } from '../../design/tokens';

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

const CodeBox = ({
  digit,
  current,
  error,
}: {
  digit?: string;
  current: boolean;
  error: boolean;
}) => {
  const ring = useFocusRing(current, error);
  return (
    <View style={styles.cell}>
      <Animated.View pointerEvents="none" style={[styles.halo, ring.halo]} />
      <Animated.View style={[styles.box, error ? styles.error : null, ring.field]}>
        <Text maxFontSizeMultiplier={fontScaleCap.display} style={styles.digit}>
          {digit ?? ''}
        </Text>
      </Animated.View>
    </View>
  );
};

/**
 * Six boxes for the email code. A single hidden TextInput takes the digits, so paste and the
 * iOS/Android one-time-code autofill work; the boxes only mirror it.
 */
export const CodeInput = forwardRef<CodeInputHandle, CodeInputProps>(
  (
    { value, onChange, onComplete, length = 6, disabled, error, accessibilityLabel, testID },
    ref,
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [focused, setFocused] = useState(false);
    // the shake and the haptic follow the error, not the digits
    const shake = useErrorShake(error ? accessibilityLabel : null);

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
      <Animated.View style={shake}>
        <Pressable onPress={() => inputRef.current?.focus()} accessible={false} style={styles.row}>
          {Array.from({ length }).map((_, index) => (
            <CodeBox
              key={index}
              digit={value[index]}
              current={focused && !disabled && index === Math.min(value.length, length - 1)}
              error={!!error}
            />
          ))}
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
      </Animated.View>
    );
  },
);

CodeInput.displayName = 'CodeInput';

export default CodeInput;

// the field height of the handbook; the focus halo is the field's 5pt one
const BOX_HEIGHT = 56;
const HALO = 5;
const BOX_RADIUS = 14;

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  // the six boxes share the width, so they fit a 320pt phone and fill a large one
  cell: { flex: 1, maxWidth: 56 },
  halo: {
    position: 'absolute',
    top: -HALO,
    left: -HALO,
    right: -HALO,
    bottom: -HALO,
    borderRadius: BOX_RADIUS + HALO,
    backgroundColor: theme.colors.yellow,
  },
  box: {
    height: BOX_HEIGHT,
    borderRadius: BOX_RADIUS,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { backgroundColor: theme.colors.errorTint },
  digit: {
    fontFamily: theme.fontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
    includeFontPadding: false,
    color: theme.colors.ink,
    fontVariant: ['tabular-nums'],
  },
  // covers the boxes so a tap anywhere focuses it; invisible but still reachable by autofill
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.011,
    color: 'transparent',
  },
}));
