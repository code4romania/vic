// Date field „Îndrăzneț”: a field with a calendar icon and the date written out ("Vin, 13 nov 2026"),
// quick options „Azi” / „Ieri” under it, and a calendar that unfolds below on tap.
// @react-native-community/datetimepicker is not installed in this app, so the calendar is our own
// pure-JS Calendar (Romanian names, Monday first).
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { palette } from '../tokens';
import { springTo } from '../motion';
import { CalendarIcon } from '../icons';
import { AppText } from './Text';
import { Calendar, CalendarLanguage } from './Calendar';
import { OptionChip } from './Chip';
import { FormRevealContext } from './FormReveal';
import { formatDateRo, useDesignLabels } from '../labels';
import {
  FieldError,
  FieldHelper,
  FieldLabel,
  fieldStyles,
  useErrorShake,
  useFocusRing,
} from './TextField';

const FOLD_GAP = 8;
/** the snappy spring has unfolded the calendar by then */
const REVEAL_AFTER_MS = 350;

export { formatDateRo };

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
  /** names in the calendar (the app's language by default) */
  language?: CalendarLanguage;
  /** how the chosen date is written in the field (the app's language by default) */
  formatDate?: (date: Date) => string;
  /** open the calendar on the year grid (e.g. for a birthday) */
  startView?: 'day' | 'year';
  onBlur?: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const DateField = ({
  label,
  value,
  onChange,
  placeholder: placeholderProp,
  required,
  optional,
  error,
  helper,
  disabled = false,
  minimumDate,
  maximumDate,
  quickOptions = true,
  initialVisibleDate,
  language: languageProp,
  formatDate: formatDateProp,
  startView,
  onBlur,
  testID = 'date-field',
  style,
}: DateFieldProps) => {
  const labels = useDesignLabels();
  const placeholder = placeholderProp ?? labels.datePlaceholder;
  const language = languageProp ?? labels.language;
  const formatDate = formatDateProp ?? labels.formatDate;
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

  // a calendar unfolding near the bottom of a form would open out of sight, behind the actions
  const reveal = useContext(FormRevealContext);
  const root = useRef<View>(null);
  useEffect(() => {
    if (!open || !calendarHeight) {
      return;
    }
    const timer = setTimeout(() => reveal(root.current), reduced ? 0 : REVEAL_AFTER_MS);
    return () => clearTimeout(timer);
  }, [open, calendarHeight, reduced, reveal]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const fold = useAnimatedStyle(
    () => ({
      height: calendarHeight * progress.value,
      // the gap above the menu folds with it, so a closed menu leaves no space
      marginTop: FOLD_GAP * progress.value,
      opacity: Math.min(1, progress.value * 2),
    }),
    [calendarHeight],
  );

  const quick = useMemo(() => {
    const today = dayStart(new Date());
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return [
      { key: 'today', label: labels.today, date: today },
      { key: 'yesterday', label: labels.yesterday, date: yesterday },
    ].filter((option) => inRange(option.date, minimumDate, maximumDate));
  }, [minimumDate, maximumDate, labels.today, labels.yesterday]);

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
    <View ref={root} style={style}>
      <FieldLabel label={label} required={required} optional={optional} />
      <Animated.View style={shake}>
        <Animated.View pointerEvents="none" style={[fieldStyles.halo, ring.halo]} />
        <Pressable
          testID={testID}
          onPress={toggle}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${value ? formatDate(value) : labels.dateEmpty}`}
          accessibilityHint={labels.dateOpenCalendar}
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
              numberOfLines={2}
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
              value={value}
              min={minimumDate}
              max={maximumDate}
              initialVisibleDate={initialVisibleDate}
              language={language}
              startView={startView}
              onSelect={choose}
              testID={`${testID}-calendar`}
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
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  calendarContent: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
}));
