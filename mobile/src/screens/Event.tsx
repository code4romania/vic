import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import { Image, StyleSheet } from 'react-native';
import FormLayout from '../layouts/FormLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ReadOnlyElement from '../components/ReadOnlyElement';
import TaskPill from '../components/TaskPill';
import { View } from 'react-native';

const event = {
  name: 'Sedinta de departament',
  target: 'Departamentul de Fundraising',
  location: 'In sediu',
  description:
    'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.',
  tasks: ['Campanie colectare 3,5%', 'Sedinta'],
};

const Event = ({ navigation }: any) => {
  console.log('Event');

  const onJoinEventButtonPress = () => {
    navigation.navigate('join-event');
  };

  return (
    <PageLayout title={i18n.t('event:details')} onBackButtonPress={navigation.goBack}>
      <FormLayout>
        <Image
          source={{ uri: 'https://picsum.photos/200/300' }}
          style={styles.image}
          resizeMode="cover"
        />
        <OrganizationIdentity uri="https://picsum.photos/200/300" name="Asociația ZEN" />
        <ReadOnlyElement label={i18n.t('event:date')} value="18:00 - 20:00, 22/12/2021" />
        <ReadOnlyElement label={i18n.t('event:name')} value={event.name} />
        <ReadOnlyElement label={i18n.t('event:target')} value={event.target} />
        <ReadOnlyElement label={i18n.t('event:location')} value={event.location} />
        <ReadOnlyElement label={i18n.t('event:description')} value={event.description} />
        <View style={styles.container}>
          <Text category="c1" appearance="hint">{`${i18n.t('event:tasks')}`}</Text>
          <View style={styles.taskContainer}>
            {event.tasks.map((task) => (
              <TaskPill key={task} label={task} />
            ))}
          </View>
        </View>
        <Button onPress={onJoinEventButtonPress}>Join</Button>
      </FormLayout>
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
