import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import { Image, StyleSheet } from 'react-native';
import FormLayout from '../layouts/FormLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ReadOnlyElement from '../components/ReadOnlyElement';
import TaskPill from '../components/TaskPill';
import { View } from 'react-native';
import { useEventQuery } from '../services/event/event.service';
import { JSONStringifyError } from '../common/utils/utils';

const Event = ({ navigation, route }: any) => {
  console.log('Event');

  const { eventId } = route.params;

  const { data: event, isLoading: isLoadingEvent, error } = useEventQuery(eventId);
  console.log('event', event);
  console.log('isLoadingEvent', isLoadingEvent);
  console.log('getEventError', error);

  const onJoinEventButtonPress = () => {
    console.log('partikip');
    // navigation.navigate('join-event');
  };

  return (
    <PageLayout
      title={i18n.t('event:details')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        loading: isLoadingEvent,
        primaryActionLabel: 'Particip',
        onPrimaryActionButtonClick: onJoinEventButtonPress,
        secondaryActionLabel: 'Nu particip',
        onSecondaryActionButtonClick: () => console.log('Nu particip'),
      }}
    >
      {!!error && (
        <Text>
          <>{JSONStringifyError(error as any)}</>
        </Text>
      )}
      {event && !error && (
        <FormLayout>
          <Image source={{ uri: event.image }} style={styles.image} resizeMode="cover" />
          <OrganizationIdentity uri={event.image || ''} name={event.organizationName || ''} />
          <ReadOnlyElement label={i18n.t('event:date')} value={event.eventInterval} />
          <ReadOnlyElement label={i18n.t('event:name')} value={event.name} />
          <ReadOnlyElement
            label={i18n.t('event:target')}
            value={event.targets?.map((target) => target.name).join(', ')}
          />
          <ReadOnlyElement label={i18n.t('event:location')} value={event.location} />
          <ReadOnlyElement label={i18n.t('event:description')} value={event.description} />
          <View style={styles.container}>
            <Text category="c1" appearance="hint">{`${i18n.t('event:tasks')}`}</Text>
            <View style={styles.taskContainer}>
              {event.tasks.map((task) => (
                <TaskPill key={task.id} label={task.name} />
              ))}
            </View>
          </View>
        </FormLayout>
      )}
    </PageLayout>
  );
};

export default Event;

const styles = StyleSheet.create({
  image: {
    borderRadius: 16,
    width: '100%',
    aspectRatio: '16/9',
  },
  container: {
    gap: 4,
  },
  taskContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
