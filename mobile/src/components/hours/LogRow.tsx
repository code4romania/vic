import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IActivityLogItem } from '../../common/interfaces/activity-log-item.interface';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { colors, fonts, StatusTone } from '../../common/theme/tokens';
import { formatLogShortDay } from '../../common/utils/activity-log-format';
import { Badge, PressableScale, VText } from '../ui';

export const LOG_STATUS_TONE: Record<ActivityLogStatus, StatusTone> = {
  [ActivityLogStatus.PENDING]: 'wait',
  [ActivityLogStatus.APPROVED]: 'ok',
  [ActivityLogStatus.REJECTED]: 'no',
};

export interface LogRowProps {
  log: IActivityLogItem;
  status: ActivityLogStatus;
  onPress: (id: string) => void;
}

/** One entry on Ore: the hours in a tile, the task, the event and the day, and the status. */
export const LogRow = ({ log, status, onPress }: LogRowProps) => {
  const { t } = useTranslation('activity_log');
  const title = log.activityType?.name || `${t('other')}`;
  const meta = [log.event?.name, formatLogShortDay(log.date)].filter(Boolean).join(' · ');
  return (
    <PressableScale
      onPress={() => onPress(log.id)}
      pressedScale={0.985}
      style={styles.row}
      accessibilityLabel={`${log.hours}h, ${title}, ${meta}`}
      testID={`log-row-${log.id}`}
    >
      <View style={styles.tile}>
        <VText style={styles.tileText}>{`${log.hours}h`}</VText>
      </View>
      <View style={styles.text}>
        <VText variant="h3" style={styles.title} numberOfLines={1}>
          {title}
        </VText>
        <VText variant="cap" numberOfLines={1}>
          {meta}
        </VText>
      </View>
      <Badge label={`${t(`status.${status}`)}`} tone={LOG_STATUS_TONE[status]} />
    </PressableScale>
  );
};

export default LogRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { fontFamily: fonts.title, fontSize: 17, lineHeight: 22, color: colors.ink },
  text: { flex: 1, gap: 3, minWidth: 0 },
  title: { fontSize: 15 },
});
