// Date field „Îndrăzneț”: a field with a calendar icon and the date written out ("Vin, 13 nov 2026"),
// quick options „Azi” / „Ieri” under it, and a calendar that unfolds below on tap.
// @react-native-community/datetimepicker is not installed in this app, so the calendar is the UI
// Kitten Calendar that FormDatePicker already used (Romanian names, Monday first).
import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { Calendar, CalendarProps, NativeDateService } from '@ui-kitten/components';
import { StyleSheet } from 'react-native-unistyles';
import { palette } from '../tokens';
import { springTo } from '../motion';
import { haptics } from '../haptics';
import { CalendarIcon } from '../icons';
import { AppText } from './Text';
import { OptionChip } from './Chip';
import {
  FieldError,
  FieldHelper,
  FieldLabel,
  fieldStyles,
  useErrorShake,
  useFocusRing,
} from './TextField';

const DAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
const MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Vin, 13 nov 2026" */
export const formatDateRo = (date: Date) =>
  `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && dayStart(a).getTime() === dayStart(b).getTime();
const inRange = (date: Date, min?: Date, max?: Date) =>
  (!min || dayStart(date) >= dayStart(min)) && (!max || dayStart(date) <= dayStart(max));

export interface DateFieldProps {
  label: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  helper?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  /** quick options „Azi” / „Ieri” under the field (default true) */
  quickOptions?: boolean;
  /** month the calendar opens on when there is no value */
  initialVisibleDate?: Date;
  dateService?: NativeDateService;
  formatDate?: (date: Date) => string;
  /** extra props for the calendar (filter, startView…) */
  calendarProps?: Partial<CalendarProps<Date>>;
  onBlur?: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const DateField = ({
  label,
  value,
  onChange,
  placeholder = 'Alege data',
  required,
  optional,
  error,
  helper,
  disabled = false,
  minimumDate,
  maximumDate,
  quickOptions = true,
  initialVisibleDate,
  dateService,
  formatDate = formatDateRo,
  calendarProps,
  onBlur,
  testID = 'date-field',
  style,
}: DateFieldProps) => {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const progress = useSharedValue(0);
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

  const fold = useAnimatedStyle(
    () => ({ height: calendarHeight * progress.value, opacity: Math.min(1, progress.value * 2) }),
    [calendarHeight],
  );

  const quick = useMemo(() => {
    const today = dayStart(new Date());
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return [
      { key: 'today', label: 'Azi', date: today },
      { key: 'yesterday', label: 'Ieri', date: yesterday },
    ].filter((option) => inRange(option.date, minimumDate, maximumDate));
  }, [minimumDate, maximumDate]);

  const choose = (date: Date) => {
    onChange(date);
    setOpen(false);
    onBlur?.();
  };

  const toggle = () => {
    setMounted(true);
    setOpen((was) => {
      if (was) {
        onBlur?.();
      }
      return !was;
    });
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
          accessibilityLabel={`${label}, ${value ? formatDate(value) : 'nicio dată aleasă'}`}
          accessibilityHint="Deschide calendarul"
          accessibilityState={{ disabled, expanded: open }}
        >
          <Animated.View
            style={[
              fieldStyles.field,
              ring.field,
              error ? fieldStyles.fieldError : null,
              disabled ? fieldStyles.fieldDisabled : null,
            ]}
          >
            <CalendarIcon size={20} color={palette.navy} strokeWidth={2} />
            <AppText
              numberOfLines={1}
              testID={`${testID}-value`}
              color={value && !disabled ? palette.navy : palette.ink2}
              style={[fieldStyles.value, value ? null : fieldStyles.placeholder]}
            >
              {value ? formatDate(value) : placeholder}
            </AppText>
          </Animated.View>
        </Pressable>
      </Animated.View>
      {quickOptions && quick.length > 0 && (
        <View style={styles.quick}>
          {quick.map((option) => (
            <OptionChip
              key={option.key}
              label={option.label}
              selected={sameDay(value, option.date)}
              disabled={disabled}
              onPress={() => choose(option.date)}
              testID={`${testID}-${option.key}`}
            />
          ))}
        </View>
      )}
      {mounted && (
        <Animated.View
          style={[styles.calendar, fold]}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
          pointerEvents={open ? 'auto' : 'none'}
        >
          <View
            style={styles.calendarContent}
            onLayout={(event: LayoutChangeEvent) =>
              setCalendarHeight(event.nativeEvent.layout.height)
            }
          >
            <Calendar
              date={value ?? undefined}
              min={minimumDate}
              max={maximumDate}
              initialVisibleDate={value ?? initialVisibleDate}
              dateService={dateService}
              {...calendarProps}
              onSelect={(date: Date) => {
                haptics.selection();
                choose(date);
              }}
              style={styles.calendarInner}
            />
          </View>
        </Animated.View>
      )}
      <FieldError message={error} />
      {!error && <FieldHelper text={helper} />}
    </View>
  );
};

export default DateField;

const styles = StyleSheet.create((theme) => ({
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: theme.space.xs },
  calendar: {
    marginTop: theme.space.xs,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  calendarContent: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  calendarInner: { borderWidth: 0, backgroundColor: 'transparent' },
}));
