import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';

const Settings = () => {
  console.log('Settings');

  return (
    <PageLayout title="Settings">
      <Text category="h1">Settings</Text>
    </PageLayout>
  );
};

export default Settings;
