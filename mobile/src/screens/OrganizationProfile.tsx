import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Layout, Text } from '@ui-kitten/components';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import EventPresenter from '../components/EventPresenter';
import SectionWrapper from '../components/SectionWrapper';

const organization = {
  name: 'Asociatia ZEN',
  volunteers: '1200',
  description:
    'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu. ',
  email: 'contact@asociatiazen.ro',
  phone: '0721002100',
  address: 'strada Luminoasa, nr 5, Cluj-Napoca',
  area: 'Iasi (jud Iasi), Cluj-Napoca (jud Cluj)',
};

const event = {
  date: '12 FEB 2022, 18:00 - 20:00',
  division: 'Departamentul de fundraising',
  location: 'Sediu',
  title: 'Sedinta departament',
};

const OrganizationProfile = ({ navigation }: any) => {
  console.log('OrganizationProfile');

  const onJoinOrganizationButtonPress = () => {
    navigation.navigate('join-organization');
  };

  return (
    <PageLayout title="Profil Organizatie" onBackButtonPress={navigation.goBack}>
      <ScrollView>
        <Layout style={styles.layout}>
          <View style={styles.nameSection}>
            <Image source={{ uri: 'https://picsum.photos/200' }} style={styles.organizationImg} />
            <View style={styles.nameContainer}>
              <Text category="h2" appearance="hint">
                {organization.name}
              </Text>
              <Text category="c1">{organization.volunteers} voluntari</Text>
            </View>
          </View>
          <View style={styles.readOnlyContainer}>
            <ReadOnlyElement label="Despre organizație" text={organization.description} />
            <ReadOnlyElement label="Email de contact" text={organization.email} />
            <ReadOnlyElement label="Telefon" text={organization.phone} />
            <ReadOnlyElement label="Adresa sediu" text={organization.address} />
            <ReadOnlyElement label="Arie de desfasurare a activitatii" text={organization.area} />
          </View>
          <SectionWrapper title="Evenimente deschise">
            <EventPresenter
              date={event.date}
              divison={event.division}
              location={event.location}
              title={event.title}
            />
            <EventPresenter
              date={event.date}
              divison={event.division}
              location={event.location}
              title={event.title}
            />
          </SectionWrapper>
          <Button onPress={onJoinOrganizationButtonPress}>Join</Button>
        </Layout>
      </ScrollView>
    </PageLayout>
  );
};

export default OrganizationProfile;

const styles = StyleSheet.create({
  layout: {
    gap: 24,
    paddingHorizontal: 16,
  },
  nameSection: {
    gap: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    gap: 16,
  },
  readOnlyContainer: {
    gap: 16,
  },
  organizationImg: {
    width: 138,
    height: 138,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
