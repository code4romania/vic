import React, { useEffect, useRef } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { IActivityLogItem } from '../../common/interfaces/activity-log-item.interface';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { formatLogShortDay } from '../../common/utils/activity-log-format';
import { fontScaleCap, palette } from '../../design/tokens';
import { duration, easing } from '../../design/motion';
import { AppText } from '../../design/components/Text';
import { StatusChip } from '../../design/components/Chip';

export const LOG_STATUS_TONE: Record<ActivityLogStatus, 'ok' | 'wait' | 'no'> = {
  [ActivityLogStatus.PENDING]: 'wait',
  [ActivityLogStatus.APPROVED]: 'ok',
  [ActivityLogStatus.REJECTED]: 'no',
};

/**
 * The new-row highlight (prototype `@keyframes newRow`, 1.4 s standard): the card fades from
 * #FFF6CC to white over the whole time while a yellow ring spreads to 4pt (90%) by 60% and
 * shrinks away by the end.
 */
export const HIGHLIGHT_MS = 1400;
const RING_IN = HIGHLIGHT_MS * 0.6;
const RING_OUT = HIGHLIGHT_MS - RING_IN;
const RING = 4;
// from this text size on, the status chip moves under the text so the title keeps its width
const STACK_FONT_SCALE = 1.2;

export interface LogRowProps {
  log: IActivityLogItem;
  status: ActivityLogStatus;
  onPress: (id: string) => void;
  /** the entry was just sent: play the new-row highlight once */
  highlight?: boolean;
  /** wait this long before the highlight (the sheet is still closing) */
  highlightDelay?: number;
}

/**
 * One entry on Ore (`.hrow`): a white 22pt card with the hours in a 52pt paper badge, the task,
 * the event and the day, and the solid status chip.
 */
export const LogRow = ({
  log,
  status,
  onPress,
  highlight = false,
  highlightDelay = 0,
}: LogRowProps) => {
  const { t } = useTranslation('activity_log');
  const reduced = useReducedMotion();
  const title = log.activityType?.name || `${t('other')}`;
  const meta = [log.event?.name, formatLogShortDay(log.date)].filter(Boolean).join(' · ');
  const statusLabel = `${t(`status.${status}`)}`;
  const { fontScale } = useWindowDimensions();
  const stacked = fontScale >= STACK_FONT_SCALE;

  // 0 = highlighted (yellow tint), 1 = resting (white card)
  const progress = useSharedValue(1);
  // read when the highlight starts only (the list re-renders with a new value)
  const delay = useRef(highlightDelay);
  delay.current = highlightDelay;
  // 0 = no ring, 1 = 4pt ring at 90%
  const ring = useSharedValue(0);
  const pressed = useSharedValue(0);
  useEffect(() => {
    if (!highlight) {
      return;
    }
    const wait = Math.max(0, delay.current);
    progress.value = 0;
    progress.value = withDelay(
      wait,
      withTiming(1, {
        duration: reduced ? duration.reduced * 4 : HIGHLIGHT_MS,
        easing: easing.standard,
      }),
    );
    if (!reduced) {
      ring.value = 0;
      ring.value = withDelay(
        wait,
        withSequence(
          withTiming(1, { duration: RING_IN, easing: easing.standard }),
          withTiming(0, { duration: RING_OUT, easing: easing.standard }),
        ),
      );
    }
  }, [highlight, progress, ring, reduced]);

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [palette.highlight, palette.card]),
    transform: [{ scale: reduced ? 1 : interpolate(pressed.value, [0, 1], [1, 0.985]) }],
  }));
  // box-shadow 0 0 0 0→4px rgba(255,210,9,0→.9→0): the ring spreads out and back (none with Reduce
  // Motion)
  const ringStyle = useAnimatedStyle(() => {
    const spread = RING * ring.value;
    return {
      opacity: 0.9 * ring.value,
      top: -spread,
      left: -spread,
      right: -spread,
      bottom: -spread,
      borderWidth: spread,
      borderRadius: 22 + spread,
    };
  });

  return (
    <Pressable
      onPress={() => onPress(log.id)}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 160 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${log.hours}h, ${title}, ${meta}, ${statusLabel}`}
      testID={`log-row-${log.id}`}
    >
      <Animated.View style={[styles.row, cardStyle]}>
        {highlight && (
          <Animated.View
            pointerEvents="none"
            style={[styles.ring, ringStyle]}
            testID={`log-row-${log.id}-highlight`}
          />
        )}
        <View style={styles.badge}>
          <AppText
            variant="title"
            style={styles.badgeText}
            numberOfLines={1}
            maxFontSizeMultiplier={fontScaleCap.display}
          >
            {`${log.hours}h`}
          </AppText>
        </View>
        <View style={styles.text}>
          <AppText variant="headline" style={styles.title}>
            {title}
          </AppText>
          {!!meta && (
            <AppText variant="caption" color={palette.ink2} style={styles.meta}>
              {meta}
            </AppText>
          )}
          {stacked && (
            <StatusChip
              label={statusLabel}
              kind={LOG_STATUS_TONE[status]}
              style={styles.stackedChip}
            />
          )}
        </View>
        {!stacked && <StatusChip label={statusLabel} kind={LOG_STATUS_TONE[status]} />}
      </Animated.View>
    </Pressable>
  );
};

export default LogRow;

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: theme.radius.row,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 12,
  },
  ring: {
    position: 'absolute',
    borderColor: theme.colors.yellow,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  text: { flex: 1, minWidth: 0 },
  // `.hrow b` 800 15.5 and the 13pt 600 meta, both at line-height 1.35
  title: { fontSize: 15.5, lineHeight: 21 },
  meta: { lineHeight: 17.5 },
  stackedChip: { marginTop: 6 },
}));
