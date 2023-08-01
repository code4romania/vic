import { Text } from '@ui-kitten/components';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import GrayIcon from './GreyIcon';
import { IActivityLogItem } from '../common/interfaces/activity-log-item.interface';
import PressableContainer from './PressableContainer';
import { useTranslation } from 'react-i18next';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface LogItemProps {
  activityLog: IActivityLogItem;
  onPress: (eventId: string) => void;
}

const LogItem = ({ activityLog, onPress }: LogItemProps) => {
  const { t } = useTranslation('activity_log');

  return (
    <PressableContainer onPress={() => onPress(activityLog.id)}>
      <View style={styles.container}>
        <GrayIcon name={activityLog.activityType?.icon || 'package'} />
        <View style={styles.textWrapper}>
          <Text
            allowFontScaling={ALLOW_FONT_SCALLING}
            category="p2"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {activityLog.activityType?.name || `${t('other')}`}
          </Text>
          <Text
            allowFontScaling={ALLOW_FONT_SCALLING}
            category="c1"
            appearance="hint"
            ellipsizeMode="tail"
            numberOfLines={1}
          >{`${activityLog.date}${activityLog.event ? ' | ' + activityLog.event.name : ''}`}</Text>
        </View>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2">{`${activityLog.hours}h`}</Text>
      </View>
    </PressableContainer>
  );
};

export default LogItem;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    gap: 16,
    flexDirection: 'row',
  },
  textWrapper: {
    flexShrink: 2,
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
});
