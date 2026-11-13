// Text field „Îndrăzneț”: the label always sits above (Manrope 800 13, red asterisk when required,
// "opțional" hint), a white 56pt field with no outline. Focus: 2pt navy outline + 5pt yellow halo.
// Error: red outline on a light rose fill, a message row with an icon that unfolds, a short shake
// and an error haptic when the error appears. The pieces (label, error row, focus ring, shake) are
// exported so Select, DateField and Stepper look and behave the same.
import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, palette } from '../tokens';
import { duration, easing, springTo } from '../motion';
import { haptics } from '../haptics';
import { AlertIcon } from '../icons';
import { AppText } from './Text';

// ── shared field pieces ──────────────────────────────────────────────────────────────────────────

export interface FieldLabelProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  nativeID?: string;
}

/** The label above a field: "Activitate *" or "Telefon opțional". */
export const FieldLabel = ({ label, required, optional, nativeID }: FieldLabelProps) => (
  <AppText variant="label" nativeID={nativeID} style={fieldStyles.label}>
    {label}
    {required ? (
      <AppText variant="label" color={palette.red}>
        {' *'}
      </AppText>
    ) : null}
    {optional && !required ? (
      <AppText variant="label" color={palette.ink2} style={fieldStyles.optional}>
        {' opțional'}
      </AppText>
    ) : null}
  </AppText>
);

const SHAKE = [-8, 7, -5, 3, 0];
// keyframes at 15 / 35 / 55 / 75 / 100% of 420 ms
const SHAKE_STEPS = [63, 84, 84, 84, 105];

/**
 * Shake + error haptic when an error appears (not on mount, not while it stays). Returns the
 * translateX style for the field. Reduce Motion: no shake, the haptic stays.
 */
export const useErrorShake = (error?: string | null) => {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const had = useRef(!!error);
  useEffect(() => {
    const has = !!error;
    if (has && !had.current) {
      haptics.error();
      if (!reduced) {
        x.value = withSequence(
          ...SHAKE.map((to, i) =>
            withTiming(to, { duration: SHAKE_STEPS[i], easing: easing.standard }),
          ),
        );
      }
    }
    had.current = has;
  }, [error, reduced, x]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
};

/**
 * Focus outline and halo. `field` goes on the white box (border color), `halo` on the yellow ring
 * behind it. In error the outline is red and there is no halo.
 */
export const useFocusRing = (focused: boolean, error: boolean) => {
  const reduced = useReducedMotion();
  const f = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    f.value = withTiming(focused ? 1 : 0, {
      duration: reduced ? duration.reduced : 200,
      easing: easing.standard,
    });
  }, [focused, reduced, f]);
  const field = useAnimatedStyle(
    () => ({
      borderColor: error
        ? palette.red
        : interpolateColor(f.value, [0, 1], ['transparent', palette.navy]),
    }),
    [error],
  );
  const halo = useAnimatedStyle(() => ({ opacity: error ? 0 : f.value * 0.55 }), [error]);
  return { field, halo };
};

export interface FieldErrorProps {
  message?: string | null;
  testID?: string;
}

/** Error row under a field: alert icon + red text; unfolds (height + opacity) when it appears. */
export const FieldError = ({ message, testID }: FieldErrorProps) => {
  const reduced = useReducedMotion();
  // keep the last text while the row folds away
  const [text, setText] = useState(message ?? '');
  const [height, setHeight] = useState(0);
  const shown = useSharedValue(0);
  useEffect(() => {
    if (message) {
      setText(message);
    }
    shown.value = springTo(message ? 1 : 0, 'snappy', reduced);
  }, [message, reduced, shown]);
  const fold = useAnimatedStyle(
    () => ({ height: height * shown.value, opacity: shown.value }),
    [height],
  );
  if (!text) {
    return null;
  }
  const visible = !!message;
  return (
    <Animated.View
      style={[fieldStyles.errorFold, fold]}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
    >
      <View
        style={fieldStyles.errorRow}
        onLayout={(event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height)}
      >
        <AlertIcon size={16} color={palette.red} strokeWidth={2.4} />
        <AppText
          testID={testID}
          color={palette.red}
          style={fieldStyles.errorText}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {visible ? message : text}
        </AppText>
      </View>
    </Animated.View>
  );
};

/** Small gray text under a field (when there is no error). */
export const FieldHelper = ({ text }: { text?: string }) =>
  text ? (
    <AppText variant="caption" color={palette.ink2} style={fieldStyles.helper}>
      {text}
    </AppText>
  ) : null;

// ── TextField ────────────────────────────────────────────────────────────────────────────────────

export interface TextFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  /** shows the "opțional" hint next to the label */
  optional?: boolean;
  error?: string | null;
  /** small text under the field when there is no error */
  helper?: string;
  /** before the text, e.g. the +40 prefix of a phone number */
  leading?: ReactNode;
  /** after the text, e.g. a show-password button */
  trailing?: ReactNode;
  /** input component to render, e.g. BottomSheetTextInput inside a sheet */
  InputComponent?: React.ComponentType<any>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    {
      label,
      required,
      optional,
      error,
      helper,
      leading,
      trailing,
      InputComponent,
      containerStyle,
      onFocus,
      onBlur,
      style,
      editable,
      multiline,
      ...props
    },
    ref,
  ) => {
    const Input: React.ComponentType<any> = InputComponent ?? TextInput;
    const inputRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => inputRef.current as TextInput);
    const [focused, setFocused] = useState(false);
    const ring = useFocusRing(focused, !!error);
    const shake = useErrorShake(error);
    const disabled = editable === false;

    return (
      <View style={[fieldStyles.wrapper, containerStyle]}>
        <FieldLabel label={label} required={required} optional={optional} />
        <Animated.View style={shake}>
          <Animated.View pointerEvents="none" style={[fieldStyles.halo, ring.halo]} />
          {/* the whole box focuses the input, not only the line of text */}
          <Pressable accessible={false} onPress={() => inputRef.current?.focus()}>
            <Animated.View
              style={[
                fieldStyles.field,
                multiline ? fieldStyles.multiline : null,
                ring.field,
                error ? fieldStyles.fieldError : null,
                disabled ? fieldStyles.fieldDisabled : null,
              ]}
            >
              {leading}
              <Input
                ref={inputRef}
                allowFontScaling
                maxFontSizeMultiplier={fontScaleCap.text}
                placeholderTextColor={palette.ink2}
                accessibilityLabel={label}
                editable={editable}
                multiline={multiline}
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
                  fieldStyles.input,
                  multiline ? fieldStyles.inputMultiline : null,
                  disabled ? fieldStyles.inputDisabled : null,
                  style,
                ]}
              />
              {trailing}
            </Animated.View>
          </Pressable>
        </Animated.View>
        <FieldError message={error} />
        {!error && <FieldHelper text={helper} />}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;

export const FIELD_HEIGHT = 56;

export const fieldStyles = StyleSheet.create((theme) => ({
  wrapper: { gap: 0 },
  label: { marginBottom: 6, marginLeft: 4 },
  optional: { fontFamily: theme.fontFamily.text },
  field: {
    minHeight: FIELD_HEIGHT,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.s,
  },
  multiline: { minHeight: 88, alignItems: 'flex-start', paddingVertical: 12 },
  fieldError: { backgroundColor: theme.colors.errorTint },
  fieldDisabled: { backgroundColor: 'transparent', borderColor: theme.colors.line },
  halo: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: theme.radius.control + 5,
    backgroundColor: theme.colors.yellow,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    fontFamily: theme.fontFamily.textBold,
    fontSize: 15.5,
    color: theme.colors.text,
    padding: 0,
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  inputDisabled: { color: theme.colors.textSecondary },
  // select / date value: wraps to a second line for long names, with room above and below
  value: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    fontFamily: theme.fontFamily.textBold,
    fontSize: 15.5,
    lineHeight: 21,
  },
  placeholder: { fontFamily: theme.fontFamily.text },
  errorFold: { overflow: 'hidden' },
  errorRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    paddingLeft: 4,
  },
  errorText: { flexShrink: 1, fontFamily: theme.fontFamily.textBold, fontSize: 13, lineHeight: 17 },
  helper: { marginTop: 6, marginLeft: 4 },
}));
