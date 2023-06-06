import { Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native';
import GrayIcon from './GreyIcon';

interface LogItemProps {
  icon: string;
  title: string;
  duration: number;
  date: string;
  onPress: () => void;
  eventName?: string;
  eva?: any;
}

const LogItem = ({ icon, title, duration, date, eventName, onPress, eva }: LogItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) =>
        pressed
          ? { backgroundColor: eva.theme['cool-gray-50'] }
          : { backgroundColor: eva.theme['cool-basic-100'] }
      }
    >
      <View style={eva.style.container}>
        <GrayIcon name={icon} />
        <View style={eva.style.textWrapper}>
          <Text category="p2" ellipsizeMode="tail" numberOfLines={1}>
            {title}
          </Text>
          <Text
            category="c1"
            appearance="hint"
            ellipsizeMode="tail"
            numberOfLines={1}
          >{`${date} | ${eventName}`}</Text>
        </View>
        <Text category="p2">{`${duration}h`}</Text>
      </View>
    </Pressable>
  );
};

export default withStyles(LogItem, () => ({
  container: {
    paddingVertical: 16,
    gap: 16,
    flexDirection: 'row',
  },
  textWrapper: {
    flexShrink: 2,
  },
}));
