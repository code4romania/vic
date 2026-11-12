import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
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

/** The new-row highlight: a yellow tint that fades to white while a yellow ring pulses. */
export const HIGHLIGHT_MS = 1400;

export interface LogRowProps {
  log: IActivityLogItem;
  status: ActivityLogStatus;
  onPress: (id: string) => void;
  /** the entry was just sent: play the new-row highlight once */
  highlight?: boolean;
}

/**
 * One entry on Ore (`.hrow`): a white 22pt card with the hours in a 52pt paper badge, the task,
 * the event and the day, and the solid status chip.
 */
export const LogRow = ({ log, status, onPress, highlight = false }: LogRowProps) => {
  const { t } = useTranslation('activity_log');
  const reduced = useReducedMotion();
  const title = log.activityType?.name || `${t('other')}`;
  const meta = [log.event?.name, formatLogShortDay(log.date)].filter(Boolean).join(' · ');
  const statusLabel = `${t(`status.${status}`)}`;

  // 0 = highlighted (yellow tint), 1 = resting (white card)
  const progress = useSharedValue(1);
  const pressed = useSharedValue(0);
  useEffect(() => {
    if (!highlight) {
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: reduced ? duration.reduced * 4 : HIGHLIGHT_MS,
      easing: easing.standard,
    });
  }, [highlight, progress, reduced]);

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [palette.highlight, palette.card]),
    transform: [{ scale: reduced ? 1 : interpolate(pressed.value, [0, 1], [1, 0.985]) }],
  }));
  // the ring grows in until 60% of the highlight, then fades out (none with Reduce Motion)
  const ringStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : interpolate(progress.value, [0, 0.6, 1], [0, 0.9, 0]),
  }));

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
          <AppText variant="headline" style={styles.title} numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="caption" color={palette.ink2} numberOfLines={1}>
            {meta}
          </AppText>
        </View>
        <StatusChip label={statusLabel} kind={LOG_STATUS_TONE[status]} />
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
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: theme.radius.row + 4,
    borderWidth: 4,
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
    lineHeight: 24,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15.5, lineHeight: 20 },
}));
