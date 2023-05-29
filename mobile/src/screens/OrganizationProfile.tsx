import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Divider, Text, Modal, Card } from '@ui-kitten/components';
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
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { ButtonType } from '../common/enums/button-type.enum';

const OrganizationProfile = ({ navigation, route }: any) => {
  console.log('OrganizationProfile', route.params);
  const { t } = useTranslation('organization_profile');
  const [isMissingIdentityModalVisible, setIsMissingIdentityDataModalVisible] =
    useState<boolean>(false);
  const { userProfile } = useAuth();

  const {
    data: organization,
    isLoading: isFetchingOrganization,
    error: getOrganizationError,
  } = useOrganization(route.params.organizationId);

  const onJoinOrganizationButtonPress = () => {
    if (!userProfile?.userPersonalData) {
      // 1. if the user doesn't have the identity data filled in show modal
      setIsMissingIdentityDataModalVisible(true);
      return;
    }

    // 2. otherwise go to join organization
    navigation.navigate('join-organization', {
      organizationId: organization?.id,
      logo: organization?.logo,
      name: organization?.name,
    });
  };

  const onGoToIdentityDataScreen = () => {
    setIsMissingIdentityDataModalVisible(false);
    navigation.navigate('identity-data', { shouldGoBack: true });
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
      <Modal visible={isMissingIdentityModalVisible}>
        <Card disabled={true}>
          <Text>Placeholder modal for bottomsheet which will redirect to identity data screen</Text>
          <Button
            label="Completeaza date"
            type={ButtonType.PRIMARY}
            onPress={onGoToIdentityDataScreen}
          />
          <Button
            label="Inapoi"
            type={ButtonType.SECONDARY}
            onPress={setIsMissingIdentityDataModalVisible.bind(null, false)}
          />
        </Card>
      </Modal>
    </PageLayout>
  );
};

export default OrganizationProfile;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
