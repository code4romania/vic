import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const Organizations = ({ navigation }: any) => {
  console.log('Organizations');

  const onViewOrganizationProfileButtonPress = () => {
    navigation.navigate('organization-profile');
  };

  return (
    <PageLayout title={i18n.t('general:organizations')}>
      <Text category="h1">Organizations</Text>
      <Button onPress={onViewOrganizationProfileButtonPress}>View Organization Profile</Button>
    </PageLayout>
  );
};

export default Organizations;
