import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Divider, Layout, List, Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import EventItem from '../components/EventItem';
import i18n from '../common/config/i18n';
import ProfileIntro from '../components/ProfileIntro';
import Button from '../components/Button';
import { ButtonType } from '../common/enums/button-type.enum';

const organization = {
  logo: 'https://picsum.photos/200',
  name: 'Asociatia ZEN',
  volunteers: '1200',
  description:
    'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu. ',
  email: 'contact@asociatiazen.ro',
  phone: '0721002100',
  address: 'strada Luminoasa, nr 5, Cluj-Napoca',
  area: 'Iasi (jud Iasi), Cluj-Napoca (jud Cluj)',
};

const events = [
  {
    id: '1',
    title: 'Event 1',
    date: `${new Date(2023, 1, 1)}`,
    location: 'Sediu',
    division: 'Departamentul de fundraising',
  },
  {
    id: '2',
    title: 'Event 2',
    date: `${new Date(2023, 2, 2)}`,
    location: 'Sediu 2',
    division: 'Departamentul de fundraising',
  },
];

const OrganizationProfile = ({ navigation }: any) => {
  console.log('OrganizationProfile');

  const onJoinOrganizationButtonPress = () => {
    navigation.navigate('join-organization');
  };

  const onEventPress = (id: string) => {
    console.log(`event with id ${id} pressed`);
  };

  return (
    <PageLayout title={i18n.t('organization_profile:title')} onBackButtonPress={navigation.goBack}>
      <List
        data={events}
        ListHeaderComponent={
          <Layout style={styles.layout}>
            <ProfileIntro
              uri={organization.logo}
              name={organization.name}
              description={`${organization.volunteers} ${i18n
                .t('general:volunteers')
                .toLowerCase()}`}
            />
            <View style={styles.readOnlyContainer}>
              <ReadOnlyElement
                label={i18n.t('organization_profile:description')}
                value={organization.description}
              />
              <ReadOnlyElement
                label={i18n.t('organization_profile:email')}
                value={organization.email}
              />
              <ReadOnlyElement
                label={i18n.t('organization_profile:phone')}
                value={organization.phone}
              />
              <ReadOnlyElement
                label={i18n.t('organization_profile:address')}
                value={organization.address}
              />
              <ReadOnlyElement
                label={i18n.t('organization_profile:area')}
                value={organization.area}
              />
            </View>
            <Text category="p2">{`${i18n.t('organization_profile:events')}`}</Text>
          </Layout>
        }
        renderItem={({ item }) => (
          <EventItem
            title={item.title}
            date={item.date}
            location={item.location}
            divison={item.division}
            onPress={onEventPress.bind(null, item.id)}
          />
        )}
        ItemSeparatorComponent={Divider}
      />
      <Button
        label={i18n.t('organization_profile:join')}
        type={ButtonType.PRIMARY}
        onPress={onJoinOrganizationButtonPress}
      />
    </PageLayout>
  );
};

export default OrganizationProfile;

const styles = StyleSheet.create({
  layout: {
    gap: 24,
  },
  readOnlyContainer: {
    gap: 16,
  },
});
