import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { VText } from './VText';
import { colors, fonts, radius } from '../../common/theme/tokens';
import { MAX_FONT_SCALE } from '../../common/constants/constants';

export interface VTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  /** Input component to render, e.g. BottomSheetTextInput inside a sheet. */
  InputComponent?: React.ComponentType<any>;
  /** Shown before the text, e.g. the +40 prefix of a phone number. */
  leading?: React.ReactNode;
  /** Small text under the field when there is no error. */
  helper?: string;
}

/** Outlined field with the label inside (canvas `.field`): 56 high, 2px ink border when focused. */
export const VTextField = forwardRef<any, VTextFieldProps>(
  ({ label, error, InputComponent, leading, helper, onFocus, onBlur, style, ...props }, ref) => {
    const Input: React.ComponentType<any> = InputComponent ?? TextInput;
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<any>(null);
    useImperativeHandle(ref, () => inputRef.current);
    return (
      <View style={styles.wrapper}>
        {/* the whole box focuses the input, not only the line of text */}
        <Pressable
          accessible={false}
          onPress={() => inputRef.current?.focus()}
          style={[
            styles.field,
            focused ? styles.focused : null,
            error ? styles.invalid : null,
            props.editable === false ? styles.fieldDisabled : null,
          ]}
        >
          <VText variant="cap">{label}</VText>
          <View style={styles.row}>
            {leading}
            <Input
              ref={inputRef}
              allowFontScaling
              maxFontSizeMultiplier={MAX_FONT_SCALE.text}
              placeholderTextColor={colors.subtle}
              accessibilityLabel={label}
              {...props}
              onFocus={(event: any) => {
                setFocused(true);
                onFocus?.(event);
              }}
              onBlur={(event: any) => {
                setFocused(false);
                onBlur?.(event);
              }}
              style={[
                styles.input,
                props.multiline ? styles.multiline : null,
                props.editable === false ? styles.disabled : null,
                style,
              ]}
            />
          </View>
        </Pressable>
        {!!error && (
          <VText variant="cap" color={colors.danger} accessibilityLiveRegion="polite">
            {error}
          </VText>
        )}
        {!error && !!helper && <VText variant="cap">{helper}</VText>}
      </View>
    );
  },
);

export default VTextField;

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  field: {
    minHeight: 56,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.subtle,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  focused: { borderWidth: 2, borderColor: colors.ink, paddingHorizontal: 13, paddingVertical: 7 },
  invalid: { borderColor: colors.danger },
  // read-only fields (e.g. the email of the account) look different from the editable ones
  fieldDisabled: { backgroundColor: colors.soft, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    padding: 0,
    marginTop: 2,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  disabled: { color: colors.muted },
});
