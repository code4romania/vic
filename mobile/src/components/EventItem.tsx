import { Avatar, Icon, Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import PressableContainer from './PressableContainer';

interface EventItemProps {
  event: IEventListItem;
  eva?: any;
  onPress: (eventId: string) => void;
}

interface EventContentRowProps {
  icon: string;
  children: string;
  eva?: any;
}

const EventContentRow = withStyles(
  ({ eva, children, icon }: EventContentRowProps) => (
    <View style={eva.style.section}>
      <Icon name={icon} style={eva.style.icon} />
      <Text category="c1" appearance="hint">
        {children}
      </Text>
    </View>
  ),
  (theme) => ({
    section: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      height: 20,
    },
    icon: {
      width: 12,
      height: 12,
      tintColor: theme['cool-gray-400'],
    },
  }),
);

const EventItem = ({ event, onPress }: EventItemProps) => (
  <PressableContainer onPress={() => onPress(event.id)}>
    <View style={styles.container}>
      <Avatar source={{ uri: event.image }} size="large" />
      <View style={styles.content}>
        <Text style={styles.title} category="p2">
          {event.name}
        </Text>
        <EventContentRow icon="clock">{event.eventInterval}</EventContentRow>
        <EventContentRow icon="map-pin">{event.location}</EventContentRow>
        <EventContentRow icon="users">{'HHAHHAHAHA'}</EventContentRow>
      </View>
      <Avatar source={{ uri: event.organizationLogo }} size={'tiny'} />
    </View>
  </PressableContainer>
);

export default EventItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    paddingVertical: 4,
    alignItems: 'center',
  },
});
