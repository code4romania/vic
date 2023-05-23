import { Avatar, Icon, Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { TouchableHighlight, View } from 'react-native';

interface EventItemProps {
  id: string;
  title: string;
  date: string;
  location: string;
  divison: string;
  onPress: (id: string) => void;
  eva?: any;
}

const EventItem = ({ id, title, date, location, divison, onPress, eva }: EventItemProps) => {
  return (
    <TouchableHighlight onPress={onPress.bind(null, id)} underlayColor={eva.theme['cool-gray-100']}>
      <View style={eva.style.container}>
        <Avatar source={{ uri: 'https://picsum.photos/200' }} size="large" />
        <View style={eva.style.textContainer}>
          <Text category="p2">{title}</Text>
          <View style={eva.style.section}>
            <Icon name="clock" style={eva.style.icon} />
            <Text category="c1" appearance="hint">
              {date}
            </Text>
          </View>
          <View style={eva.style.section}>
            <Icon name="map-pin" style={eva.style.icon} />
            <Text category="c1" appearance="hint">
              {location}
            </Text>
          </View>
          <View style={eva.style.section}>
            <Icon name="users" style={eva.style.icon} />
            <Text category="c1" appearance="hint">
              {divison}
            </Text>
          </View>
        </View>
        <Avatar source={{ uri: 'https://picsum.photos/200' }} size={'tiny'} />
      </View>
    </TouchableHighlight>
  );
};

export default withStyles(EventItem, (theme) => ({
  container: {
    gap: 16,
    flexDirection: 'row',
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
