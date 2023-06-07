import { Avatar, Icon, Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import PressableContainer from './PressableContainer';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('event');

  const mapEventType = (): string => {
    if (event.isPublic) {
      return t('type.public');
    }

    if (!event.isPublic && !event.targets?.length) {
      return t('type.all_organization');
    }

    return event.targets?.map((target) => target.name).join(', ') || '';
  };

  return (
    <PressableContainer onPress={() => onPress(event.id)}>
      <View style={styles.container}>
        <Avatar source={{ uri: event.image }} size="large" />
        <View style={styles.content}>
          <Text style={styles.title} category="p2">
            {event.name}
          </Text>
          <EventContentRow icon="clock">{event.eventInterval}</EventContentRow>
          <EventContentRow icon="map-pin">{event.location}</EventContentRow>
          <EventContentRow icon="users">{mapEventType()}</EventContentRow>
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
});
