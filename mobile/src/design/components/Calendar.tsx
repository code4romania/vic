// Calendar „Îndrăzneț”: a month grid in pure JS (no native picker). Romanian names, weeks start on
// Monday, 44pt prev / next buttons, min / max bounds. The selected day is a navy circle with yellow
// text, today a navy ring, days out of range sit at 35%. The title opens a year grid, then a month
// grid, so a birthday 30 years back is three taps away. Changing the month slides the grid on the
// snappy spring; with Reduce Motion it just swaps.
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { hit, palette } from '../tokens';
import { springTo } from '../motion';
import { haptics } from '../haptics';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { AppText } from './Text';

export type CalendarLanguage = 'ro' | 'en';

interface CalendarNames {
  /** Sunday first, like Date.getDay() */
  days: string[];
  /** Monday first, for the header row */
  daysShort: string[];
  months: string[];
  monthsShort: string[];
  prevMonth: string;
  nextMonth: string;
  prevYears: string;
  nextYears: string;
  chooseYear: string;
  chooseMonth: string;
  today: string;
}

export const CALENDAR_NAMES: Record<CalendarLanguage, CalendarNames> = {
  ro: {
    days: ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'],
    daysShort: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'],
    months: [
      'ianuarie',
      'februarie',
      'martie',
      'aprilie',
      'mai',
      'iunie',
      'iulie',
      'august',
      'septembrie',
      'octombrie',
      'noiembrie',
      'decembrie',
    ],
    monthsShort: [
      'Ian',
      'Feb',
      'Mar',
      'Apr',
      'Mai',
      'Iun',
      'Iul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    prevMonth: 'Luna anterioară',
    nextMonth: 'Luna următoare',
    prevYears: 'Anii anteriori',
    nextYears: 'Anii următori',
    chooseYear: 'Alege anul',
    chooseMonth: 'Alege luna',
    today: 'azi',
  },
  en: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthsShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    prevYears: 'Previous years',
    nextYears: 'Next years',
    chooseYear: 'Choose the year',
    chooseMonth: 'Choose the month',
    today: 'today',
  },
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** „Joi, 12 noiembrie 2026” */
export const dayLabel = (date: Date, language: CalendarLanguage = 'ro') => {
  const names = CALENDAR_NAMES[language];
  return `${names.days[date.getDay()]}, ${date.getDate()} ${
    names.months[date.getMonth()]
  } ${date.getFullYear()}`;
};

/** „Noiembrie 2026” */
export const monthTitle = (year: number, month: number, language: CalendarLanguage = 'ro') =>
  `${capitalize(CALENDAR_NAMES[language].months[month])} ${year}`;

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && dayStart(a).getTime() === dayStart(b).getTime();
const monthIndex = (year: number, month: number) => year * 12 + month;

/**
 * The weeks of a month, Monday first, always 6 rows (so the height never jumps); cells outside the
 * month are null.
 */
export const monthWeeks = (year: number, month: number): (Date | null)[][] => {
  // Monday = 0 … Sunday = 6
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < 42; i++) {
    const day = i - lead + 1;
    cells.push(day >= 1 && day <= days ? new Date(year, month, day) : null);
  }
  return Array.from({ length: 6 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
};

const YEARS_PER_PAGE = 12;
/** the year page that holds `year`: 12 years, aligned on multiples of 12 */
export const yearPageStart = (year: number) => Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;

type View_ = 'day' | 'month' | 'year';

export interface CalendarProps {
  value?: Date | null;
  onSelect: (date: Date) => void;
  min?: Date;
  max?: Date;
  /** month shown first when there is no value (defaults to today) */
  initialVisibleDate?: Date;
  /** open on the year grid (e.g. for a birthday) */
  startView?: 'day' | 'year';
  language?: CalendarLanguage;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const SLIDE = 28;

const NavButton = ({
  direction,
  label,
  disabled,
  onPress,
  testID,
}: {
  direction: 'prev' | 'next';
  label: string;
  disabled: boolean;
  onPress: () => void;
  testID: string;
}) => {
  const Icon = direction === 'prev' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.nav,
        pressed ? styles.navPressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Icon size={22} color={palette.navy} strokeWidth={2.4} />
    </Pressable>
  );
};

export const Calendar = ({
  value,
  onSelect,
  min,
  max,
  initialVisibleDate,
  startView = 'day',
  language = 'ro',
  testID = 'calendar',
  style,
}: CalendarProps) => {
  const names = CALENDAR_NAMES[language];
  const reduced = useReducedMotion();
  const start = value ?? initialVisibleDate ?? new Date();
  const [visible, setVisible] = useState({ year: start.getFullYear(), month: start.getMonth() });
  const [view, setView] = useState<View_>(startView);
  const [yearPage, setYearPage] = useState(yearPageStart(start.getFullYear()));
  const offset = useSharedValue(0);
  const today = dayStart(new Date());

  // a new value from outside (e.g. „Azi”) brings its month into view
  const valueTime = value ? dayStart(value).getTime() : null;
  useEffect(() => {
    if (valueTime !== null) {
      const date = new Date(valueTime);
      setVisible({ year: date.getFullYear(), month: date.getMonth() });
    }
  }, [valueTime]);

  const minMonth = min ? monthIndex(min.getFullYear(), min.getMonth()) : -Infinity;
  const maxMonth = max ? monthIndex(max.getFullYear(), max.getMonth()) : Infinity;
  const current = monthIndex(visible.year, visible.month);
  const dayDisabled = (date: Date) =>
    (!!min && date < dayStart(min)) || (!!max && date > dayStart(max));
  const yearDisabled = (year: number) =>
    (!!min && year < min.getFullYear()) || (!!max && year > max.getFullYear());

  const weeks = useMemo(() => monthWeeks(visible.year, visible.month), [visible]);

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    opacity: 1 - Math.min(1, Math.abs(offset.value) / SLIDE) * 0.6,
  }));

  const shiftMonth = (step: number) => {
    const next = current + step;
    if (next < minMonth || next > maxMonth) {
      return;
    }
    haptics.selection();
    setVisible({ year: Math.floor(next / 12), month: next % 12 });
    if (!reduced) {
      // the new month comes in from the side it lies on
      offset.value = step * SLIDE;
      offset.value = springTo(0, 'snappy', false);
    }
  };

  const title =
    view === 'year'
      ? `${yearPage} – ${yearPage + YEARS_PER_PAGE - 1}`
      : view === 'month'
        ? `${visible.year}`
        : monthTitle(visible.year, visible.month, language);

  const prev = () => {
    if (view === 'year') {
      setYearPage((page) => page - YEARS_PER_PAGE);
    } else if (view === 'month') {
      setVisible((v) => ({ ...v, year: v.year - 1 }));
    } else {
      shiftMonth(-1);
    }
  };
  const next = () => {
    if (view === 'year') {
      setYearPage((page) => page + YEARS_PER_PAGE);
    } else if (view === 'month') {
      setVisible((v) => ({ ...v, year: v.year + 1 }));
    } else {
      shiftMonth(1);
    }
  };
  const prevDisabled =
    view === 'year'
      ? yearDisabled(yearPage - 1)
      : view === 'month'
        ? yearDisabled(visible.year - 1)
        : current - 1 < minMonth;
  const nextDisabled =
    view === 'year'
      ? yearDisabled(yearPage + YEARS_PER_PAGE)
      : view === 'month'
        ? yearDisabled(visible.year + 1)
        : current + 1 > maxMonth;

  const openYears = () => {
    haptics.selection();
    if (view === 'day') {
      setYearPage(yearPageStart(visible.year));
      setView('year');
    } else {
      setView('day');
    }
  };

  return (
    <View style={[styles.root, style]} testID={testID}>
      <View style={styles.header}>
        <NavButton
          direction="prev"
          label={
            view === 'year'
              ? names.prevYears
              : view === 'month'
                ? `${visible.year - 1}`
                : names.prevMonth
          }
          disabled={prevDisabled}
          onPress={prev}
          testID={`${testID}-prev`}
        />
        <Pressable
          testID={`${testID}-title`}
          onPress={openYears}
          accessibilityRole="button"
          accessibilityLabel={view === 'day' ? `${title}, ${names.chooseYear}` : title}
          accessibilityState={{ expanded: view !== 'day' }}
          style={({ pressed }) => [styles.title, pressed ? styles.navPressed : null]}
        >
          <AppText variant="headline" style={styles.titleText} numberOfLines={1}>
            {title}
          </AppText>
          <View style={view === 'day' ? null : styles.chevronUp}>
            <ChevronDownIcon size={18} color={palette.navy} strokeWidth={2.4} />
          </View>
        </Pressable>
        <NavButton
          direction="next"
          label={
            view === 'year'
              ? names.nextYears
              : view === 'month'
                ? `${visible.year + 1}`
                : names.nextMonth
          }
          disabled={nextDisabled}
          onPress={next}
          testID={`${testID}-next`}
        />
      </View>

      {view === 'day' && (
        <Animated.View style={slide}>
          <View
            style={styles.row}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {names.daysShort.map((day) => (
              <View key={day} style={styles.weekday}>
                <AppText variant="overline" color={palette.ink2}>
                  {day}
                </AppText>
              </View>
            ))}
          </View>
          {weeks.map((week, row) => (
            <View key={row} style={styles.row}>
              {week.map((date, col) => {
                if (!date) {
                  return <View key={col} style={styles.cell} />;
                }
                const selected = sameDay(value, date);
                const isToday = sameDay(today, date);
                const disabled = dayDisabled(date);
                return (
                  <Pressable
                    key={col}
                    testID={`${testID}-day-${date.getDate()}`}
                    disabled={disabled}
                    onPress={() => {
                      haptics.selection();
                      onSelect(date);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isToday
                        ? `${dayLabel(date, language)}, ${names.today}`
                        : dayLabel(date, language)
                    }
                    accessibilityState={{ selected, disabled }}
                    style={[styles.cell, disabled ? styles.disabled : null]}
                  >
                    <View
                      style={[
                        styles.day,
                        isToday ? styles.today : null,
                        selected ? styles.selected : null,
                      ]}
                    >
                      <AppText
                        variant={selected || isToday ? 'bodyStrong' : 'body'}
                        color={selected ? palette.yellow : palette.navy}
                        style={styles.number}
                      >
                        {date.getDate()}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Animated.View>
      )}

      {view === 'year' && (
        <View style={styles.grid}>
          {Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPage + i).map((year) => {
            const disabled = yearDisabled(year);
            const selected = year === visible.year;
            return (
              <Pressable
                key={year}
                testID={`${testID}-year-${year}`}
                disabled={disabled}
                onPress={() => {
                  haptics.selection();
                  // keep the month inside the bounds of the chosen year
                  setVisible((v) => {
                    const index = Math.min(Math.max(monthIndex(year, v.month), minMonth), maxMonth);
                    return { year: Math.floor(index / 12), month: index % 12 };
                  });
                  setView('month');
                }}
                accessibilityRole="button"
                accessibilityLabel={`${year}`}
                accessibilityState={{ selected, disabled }}
                style={[styles.gridCell, disabled ? styles.disabled : null]}
              >
                <View style={[styles.gridChip, selected ? styles.selected : null]}>
                  <AppText
                    variant="bodyStrong"
                    color={selected ? palette.yellow : palette.navy}
                    style={styles.number}
                  >
                    {year}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {view === 'month' && (
        <View style={styles.grid}>
          {names.monthsShort.map((label, month) => {
            const index = monthIndex(visible.year, month);
            const disabled = index < minMonth || index > maxMonth;
            const selected = month === visible.month;
            return (
              <Pressable
                key={label}
                testID={`${testID}-month-${month}`}
                disabled={disabled}
                onPress={() => {
                  haptics.selection();
                  setVisible((v) => ({ ...v, month }));
                  setView('day');
                }}
                accessibilityRole="button"
                accessibilityLabel={`${capitalize(names.months[month])} ${visible.year}`}
                accessibilityState={{ selected, disabled }}
                style={[styles.gridCell, disabled ? styles.disabled : null]}
              >
                <View style={[styles.gridChip, selected ? styles.selected : null]}>
                  <AppText variant="bodyStrong" color={selected ? palette.yellow : palette.navy}>
                    {label}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create((theme) => ({
  root: { width: '100%', paddingHorizontal: theme.space.xs, paddingVertical: theme.space.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.space.xxs,
  },
  nav: {
    width: hit.min,
    height: hit.min,
    borderRadius: hit.min / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPressed: { backgroundColor: theme.colors.paper },
  title: {
    minHeight: hit.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.space.m,
    borderRadius: theme.radius.pill,
    flexShrink: 1,
  },
  titleText: { fontVariant: ['tabular-nums'] },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, height: 28, alignItems: 'center', justifyContent: 'center' },
  cell: { flex: 1, height: hit.min, alignItems: 'center', justifyContent: 'center' },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: { borderWidth: 2, borderColor: palette.navy },
  selected: { backgroundColor: palette.navy, borderColor: palette.navy },
  number: { fontVariant: ['tabular-nums'] },
  disabled: { opacity: 0.35 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: theme.space.xxs },
  gridCell: {
    width: '33.333%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridChip: {
    minWidth: 72,
    height: hit.min,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space.m,
  },
}));
