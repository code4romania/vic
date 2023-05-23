import React from 'react';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import { EventsTabs } from '../common/constants/events-tabs';
import { VirtualizedList } from 'react-native';
import Tabs from '../components/Tabs';
import EventItem from '../components/EventItem';
import { Divider } from '@ui-kitten/components';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  division: string;
}

const Events = ({ navigation }: any) => {
  console.log('Events');

  const getItem = (_data: unknown, index: number): Event => ({
    id: Math.random().toString(12).substring(0),
    title: `Event ${index + 1}`,
    date: `${new Date(2023, 2, index + 1)}`,
    location: 'Sediu',
    division: 'Departamentul de fundraising',
  });

  const getItemCount = (_data: unknown) => 50;

  const onTabClick = (tabKey: string | number) => {
    console.log(tabKey);
  };

  const onEventPress = (id: string) => {
    console.log(id);
    navigation.navigate('event', { id });
  };

  return (
    <PageLayout title={i18n.t('tabs:events')}>
      <Tabs tabs={EventsTabs} onClick={onTabClick}>
        <VirtualizedList
          initialNumToRender={4}
          getItemCount={getItemCount}
          keyExtractor={(item) => item.id}
          getItem={getItem}
          renderItem={({ item }) => (
            <EventItem
              id={item.id}
              title={item.title}
              date={item.date}
              location={item.location}
              divison={item.division}
              onPress={onEventPress.bind(null, item.id)}
            />
          )}
          ItemSeparatorComponent={Divider}
        />
      </Tabs>
    </PageLayout>
  );
};

export default Events;
