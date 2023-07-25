import { Avatar, Icon, Text, useTheme, withStyles } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import PressableContainer from './PressableContainer';
import { mapEventType } from '../common/utils/helpers';
import ImageWithPreload from './ImageWithPreload';

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

const EventItem = ({ event, onPress }: EventItemProps) => {
  const theme = useTheme();
  console.log('event.poster', event.poster);
  return (
    <PressableContainer onPress={onPress.bind(null, event.id)}>
      <View style={styles.container}>
        {event.poster ? (
          <ImageWithPreload source={event.poster} styles={styles.profileImage} />
        ) : (
          <View
            style={{
              ...styles.image,
              borderColor: theme['cool-gray-200'],
              backgroundColor: theme['cool-gray-100'],
            }}
          >
            <Icon name="calendar" style={{ ...styles.icon, color: theme['cool-gray-500'] }} />
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.title} category="p2">
            {event.name}
          </Text>
          <EventContentRow icon="clock">{event.eventInterval}</EventContentRow>
          <EventContentRow icon="map-pin">{event.location}</EventContentRow>
          <EventContentRow icon="users">{mapEventType(event)}</EventContentRow>
        </View>
        <Avatar source={{ uri: event.organizationLogo }} size={'tiny'} />
      </View>
    </PressableContainer>
  );
};

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
    paddingBottom: 4,
    alignItems: 'center',
  },
  profileImage: {
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
