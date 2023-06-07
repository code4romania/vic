import { Avatar, Icon, Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import { formatEventDate } from '../common/utils/utils';

interface EventItemProps {
  event: IEventListItem;
  eva?: any;
  organizationLogo?: string;
}

const EventItem = ({ event, eva, organizationLogo }: EventItemProps) => {
  console.log('event', event);
  return (
    <View style={eva.style.container}>
      <Avatar source={{ uri: event.image }} size="large" />
      <View style={eva.style.textContainer}>
        <Text category="p2">{event.name}</Text>
        <View style={eva.style.section}>
          <Icon name="clock" style={eva.style.icon} />
          <Text category="c1" appearance="hint">
            {formatEventDate(event.startDate, event.endDate)}
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
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 16,
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
