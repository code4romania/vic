import { Avatar, Icon, Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';

interface EventItemProps {
  event: IEventListItem;
  eva?: any;
  organizationLogo?: string;
}

const EventItem = ({ event, eva, organizationLogo }: EventItemProps) => {
  return (
    <View style={eva.style.container}>
      <Avatar source={{ uri: event.image }} size="large" />
      <View style={eva.style.textContainer}>
        <Text category="p2">{event.name}</Text>
        <View style={eva.style.section}>
          <Icon name="clock" style={eva.style.icon} />
          <Text category="c1" appearance="hint">
            {event.startDate.toISOString()}
          </Text>
        </View>
        <View style={eva.style.section}>
          <Icon name="map-pin" style={eva.style.icon} />
          <Text category="c1" appearance="hint">
            {event.location}
          </Text>
        </View>
        <View style={eva.style.section}>
          <Icon name="users" style={eva.style.icon} />
          <Text category="c1" appearance="hint">
            {event.isPublic ? 'Eveniment deschis' : ''}
          </Text>
        </View>
      </View>
      {organizationLogo && <Avatar source={{ uri: organizationLogo }} size={'tiny'} />}
    </View>
  );
};

export default withStyles(EventItem, (theme) => ({
  container: {
    gap: 16,
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme['cool-gray-200'],
  },
  section: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  textContainer: {
    flex: 1,
  },
  icon: {
    width: 12,
    height: 12,
    tintColor: theme['cool-gray-400'],
  },
}));
