import { Text } from '@ui-kitten/components';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import GrayIcon from './GreyIcon';
import { IActivityLogItem } from '../common/interfaces/activity-log-item.interface';
import PressableContainer from './PressableContainer';

interface LogItemProps {
  activityLog: IActivityLogItem;
  onPress: (eventId: string) => void;
}

const LogItem = ({ activityLog, onPress }: LogItemProps) => {
  console.log('activityLog', activityLog);
  return (
    <PressableContainer onPress={() => onPress(activityLog.id)}>
      <View style={styles.container}>
        <GrayIcon name={'heart'} />
        <View style={styles.textWrapper}>
          <Text category="p2" ellipsizeMode="tail" numberOfLines={1}>
            {activityLog.activityTypeName}
          </Text>
          <Text category="c1" appearance="hint" ellipsizeMode="tail" numberOfLines={1}>{`${
            activityLog.date
          }${activityLog.eventName ? ' | ' + activityLog.eventName : ''}`}</Text>
        </View>
        <Text category="p2">{`${activityLog.hours}h`}</Text>
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
