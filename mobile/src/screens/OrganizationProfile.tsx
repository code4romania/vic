import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Layout } from '@ui-kitten/components';
import { StyleSheet, View, ScrollView } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
// import EventItem from '../components/EventItem';
// import SectionWrapper from '../components/SectionWrapper';
import i18n from '../common/config/i18n';
import ProfileIntro from '../components/ProfileIntro';
import { useOrganization } from '../services/organization/organization.service';

const OrganizationProfile = ({ navigation, route }: any) => {
  console.log('OrganizationProfile', route.params);

  const {
    data: organization,
    // isLoading: isFetchingOrganization,
    // error: getOrganizationError,
  } = useOrganization(route.params.organizationId);

  const onJoinOrganizationButtonPress = () => {
    navigation.navigate('join-organization');
  };

  // const onEventPress = () => {
  //   console.log('event pressed');
  // };

  return (
    <PageLayout title={i18n.t('organization_profile:title')} onBackButtonPress={navigation.goBack}>
      <ScrollView>
        {organization && (
          <Layout style={styles.layout}>
            <ProfileIntro
              uri={organization.logo}
              name={organization.name}
              description={`${organization.numberOfVolunteers} ${i18n
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
                value={organization.activityArea}
              />
            </View>
            {/* <SectionWrapper title={i18n.t('organization_profile:events')}>
              <EventItem
                date={event.date}
                divison={event.division}
                location={event.location}
                title={event.title}
                onPress={onEventPress}
              />
              <EventItem
                date={event.date}
                divison={event.division}
                location={event.location}
                title={event.title}
                onPress={onEventPress}
              />
            </SectionWrapper> */}
            <Button onPress={onJoinOrganizationButtonPress}>Join</Button>
          </Layout>
        )}
      </ScrollView>
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
