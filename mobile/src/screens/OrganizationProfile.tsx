import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Divider, Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import SectionWrapper from '../components/SectionWrapper';
import i18n from '../common/config/i18n';
import ProfileIntro from '../components/ProfileIntro';
import { useOrganization } from '../services/organization/organization.service';
import LoadingScreen from '../components/LoadingScreen';
import { JSONStringifyError } from '../common/utils/utils';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import EventItem from '../components/EventItem';
import { useTranslation } from 'react-i18next';

const OrganizationProfile = ({ navigation, route }: any) => {
  console.log('OrganizationProfile', route.params);
  const { t } = useTranslation('organization_profile');

  const {
    data: organization,
    isLoading: isFetchingOrganization,
    error: getOrganizationError,
  } = useOrganization(route.params.organizationId);

  const onJoinOrganizationButtonPress = () => {
    navigation.navigate('join-organization');
  };

  return (
    <PageLayout
      title={i18n.t('organization_profile:title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('join'),
        onPrimaryActionButtonClick: onJoinOrganizationButtonPress,
      }}
    >
      {isFetchingOrganization && <LoadingScreen />}
      {!!getOrganizationError && !isFetchingOrganization && (
        <Text>{JSONStringifyError(getOrganizationError as any)}</Text>
      )}
      {!isFetchingOrganization && organization && (
        <ScrollViewLayout>
          <ProfileIntro
            uri={organization.logo}
            name={organization.name}
            description={`${organization.numberOfVolunteers} ${i18n
              .t('general:volunteers')
              .toLowerCase()}`}
          />
          <View style={styles.container}>
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
          <SectionWrapper title={i18n.t('organization_profile:events')}>
            <ScrollViewLayout>
              <View style={styles.container}>
                {organization.events.map((event) => (
                  <View style={styles.container} key={event.id}>
                    <EventItem event={event} organizationLogo={organization.logo} />
                    <Divider />
                  </View>
                ))}
                {organization.events.length === 0 && (
                  <Text category="p1">{`${t('no_events')}`}</Text>
                )}
              </View>
            </ScrollViewLayout>
          </SectionWrapper>
        </ScrollViewLayout>
      )}
    </PageLayout>
  );
};

export default OrganizationProfile;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
