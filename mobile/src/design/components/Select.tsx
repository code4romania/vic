// Select „Îndrăzneț”: looks like a field (label above, white box, ChevronDown). With up to 6 options
// it unfolds an inline menu under the field (white, radius 18, rows split by hairlines, height on
// the snappy spring). With more options it calls `onOpenSheet`; the sheet itself lives with the
// caller, which can mount it next to the field through `renderSheet`.
import React, { ReactNode, useEffect, useState } from 'react';
import { Keyboard, LayoutChangeEvent, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { palette } from '../tokens';
import { springTo } from '../motion';
import { haptics } from '../haptics';
import { CheckIcon, ChevronDownIcon } from '../icons';
import { AppText } from './Text';
import {
  FieldError,
  FieldHelper,
  FieldLabel,
  fieldStyles,
  useErrorShake,
  useFocusRing,
} from './TextField';

const FOLD_GAP = 8;
export type SelectKey = string | number;

export interface SelectOption<K extends SelectKey = SelectKey> {
  key: K;
  label: string;
  /** short text on the right of the menu row (prototype `.menu button .over`, e.g. „13 NOV”) */
  detail?: string;
}

export interface SelectProps<K extends SelectKey = SelectKey> {
  label: string;
  options: SelectOption<K>[];
  value?: K | null;
  onChange: (key: K) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  helper?: string;
  disabled?: boolean;
  testID?: string;
  /** testID of each menu row; defaults to `${testID}-option-${key}` */
  optionTestID?: (key: K) => string;
  /** above this many options the select asks for a sheet instead of the inline menu (default 6) */
  inlineMax?: number;
  /** opens the sheet with search for long lists */
  onOpenSheet?: () => void;
  /** rendered after the field, e.g. the sheet that `onOpenSheet` presents */
  renderSheet?: () => ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const INLINE_MAX = 6;

export function Select<K extends SelectKey>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Alege',
  required,
  optional,
  error,
  helper,
  disabled = false,
  testID,
  optionTestID,
  inlineMax = INLINE_MAX,
  onOpenSheet,
  renderSheet,
  accessibilityLabel,
  style,
}: SelectProps<K>) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  // rows stay mounted after the first opening so the menu can fold away
  const [mounted, setMounted] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const progress = useSharedValue(0);
  const sheetMode = options.length > inlineMax && !!onOpenSheet;
  const selected = options.find((option) => option.key === value);
  const ring = useFocusRing(open, !!error);
  const shake = useErrorShake(error);

  useEffect(() => {
    progress.value = springTo(open ? 1 : 0, 'snappy', reduced);
  }, [open, reduced, progress]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const menuStyle = useAnimatedStyle(
    () => ({
      height: menuHeight * progress.value,
      // the gap above the menu folds with it, so a closed menu leaves no space
      marginTop: FOLD_GAP * progress.value,
      opacity: Math.min(1, progress.value * 2),
    }),
    [menuHeight],
  );
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const toggle = () => {
    // A picker takes over from the form input; don't leave that input focused behind its sheet.
    Keyboard.dismiss();
    if (sheetMode) {
      onOpenSheet?.();
      return;
    }
    setMounted(true);
    setOpen((was) => !was);
  };

  const pick = (key: K) => {
    haptics.selection();
    onChange(key);
    setOpen(false);
  };

  return (
    <View style={style}>
      <FieldLabel label={label} required={required} optional={optional} />
      <Animated.View style={shake}>
        <Animated.View pointerEvents="none" style={[fieldStyles.halo, ring.halo]} />
        <Pressable
          testID={testID}
          onPress={toggle}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={
            accessibilityLabel ?? `${label}${selected ? `, ${selected.label}` : ''}`
          }
          accessibilityHint={sheetMode ? 'Deschide lista de opțiuni' : 'Deschide meniul'}
          accessibilityState={{ disabled, expanded: sheetMode ? undefined : open }}
        >
          <Animated.View
            style={[
              fieldStyles.field,
              ring.field,
              error ? fieldStyles.fieldError : null,
              disabled ? fieldStyles.fieldDisabled : null,
            ]}
          >
            <AppText
              numberOfLines={2}
              color={selected ? (disabled ? palette.ink2 : palette.navy) : palette.ink2}
              style={[fieldStyles.value, selected ? null : fieldStyles.placeholder]}
            >
              {selected ? selected.label : placeholder}
            </AppText>
            <Animated.View style={chevronStyle}>
              <ChevronDownIcon size={20} color={palette.navy} strokeWidth={2} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
      {mounted && !sheetMode && (
        <Animated.View
          style={[styles.menu, menuStyle]}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
          pointerEvents={open ? 'auto' : 'none'}
        >
          <View
            style={styles.menuContent}
            onLayout={(event: LayoutChangeEvent) => setMenuHeight(event.nativeEvent.layout.height)}
          >
            {options.map((option, index) => {
              const active = option.key === value;
              return (
                <Pressable
                  key={`${option.key}`}
                  testID={
                    optionTestID
                      ? optionTestID(option.key)
                      : testID && `${testID}-option-${option.key}`
                  }
                  onPress={() => pick(option.key)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    option.detail ? `${option.label}, ${option.detail}` : undefined
                  }
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 ? styles.rowDivider : null,
                    pressed ? styles.rowPressed : null,
                  ]}
                >
                  <AppText
                    color={palette.navy}
                    style={[styles.rowLabel, active ? styles.rowActive : null]}
                  >
                    {option.label}
                  </AppText>
                  {(!!option.detail || active) && (
                    <View style={styles.rowEnd}>
                      {!!option.detail && (
                        <AppText
                          variant="overline"
                          color={palette.ink2}

                          testID={testID ? `${testID}-option-${option.key}-detail` : undefined}
                        >
                          {option.detail}
                        </AppText>
                      )}
                      {active && <CheckIcon size={18} color={palette.navy} strokeWidth={2.6} />}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      )}
      <FieldError message={error} />
      {!error && <FieldHelper text={helper} />}
      {renderSheet?.()}
    </View>
  );
}

export default Select;

const styles = StyleSheet.create((theme) => ({
  menu: {
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  menuContent: { position: 'absolute', top: 0, left: 0, right: 0 },
  row: {
    minHeight: theme.hit.min,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.s,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.line },
  rowPressed: { backgroundColor: theme.colors.paper },
  rowLabel: {
    flexShrink: 1,
    fontFamily: theme.fontFamily.textBold,
    fontSize: 14.5,
    lineHeight: 20,
  },
  rowActive: { fontFamily: theme.fontFamily.textHeavy },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: theme.space.xs },
}));
